import { requireAuth } from "../middlewares/supabaseAuth";
// Authentication: Clerk JWT — every route requires a valid session via requireAuth middleware
// Data storage: entries stored in `entries` table, scoped by userId from Clerk auth

import { Router, type IRouter, type Request, type Response } from "express";

import { eq, and, desc } from "drizzle-orm";
import { db, entriesTable } from "@workspace/db";
import {
  ListEntriesQueryParams,
  CreateEntryBody,
  GetEntryParams,
  UpdateEntryParams,
  UpdateEntryBody,
  DeleteEntryParams,
  ListEntriesResponse,
  GetEntryResponse,
  UpdateEntryResponse,
  GetEntryStatsResponse,
  GetRecentEntriesResponse,
  RewriteEntryBody,
  RewriteEntryResponse,
} from "@workspace/api-zod";
import OpenAI from "openai";

const router: IRouter = Router();

// Convert Drizzle Date objects to ISO strings before Zod parses the response
function serializeRow<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v]),
  ) as T;
}


// GET /entries — list entries for authenticated user (optionally filtered by date/week/month)
router.get("/entries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = ListEntriesQueryParams.safeParse(req.query);

  let rows;
  if (parsed.success && parsed.data.date) {
    rows = await db
      .select()
      .from(entriesTable)
      .where(and(eq(entriesTable.userId, userId), eq(entriesTable.date, parsed.data.date)))
      .orderBy(desc(entriesTable.createdAt));
  } else {
    rows = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.userId, userId))
      .orderBy(desc(entriesTable.createdAt));
  }

  let filtered = rows;

  if (parsed.success && parsed.data.week != null) {
    filtered = filtered.filter((r) => r.week === parsed.data.week);
  }

  if (parsed.success && parsed.data.month) {
    filtered = filtered.filter((r) => r.date.startsWith(parsed.data.month!));
  }

  res.json(ListEntriesResponse.parse(filtered.map(serializeRow)));
});

// POST /entries — create a new logbook entry linked to authenticated user
router.post("/entries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let entry;
  try {
    const result = await db
      .insert(entriesTable)
      .values({ ...parsed.data, userId })
      .returning();
    entry = result[0];
  } catch (err: any) {
    console.error("[DB_INSERT_ERROR]", err?.message, err?.code);
    res.status(500).json({ error: "Failed to create entry. Please try again." });
    return;
  }

  res.status(201).json(GetEntryResponse.parse(serializeRow(entry)));
});

// GET /entries/stats — aggregate stats for authenticated user's entries
router.get("/entries/stats", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(desc(entriesTable.date));

  const totalEntries = rows.length;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const dateSet = new Set(rows.map((r) => r.date));
  const today = new Date();
  let checkDate = new Date(today);

  while (dateSet.has(checkDate.toISOString().slice(0, 10))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const sortedDates = Array.from(dateSet).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const weeks = new Set(rows.filter((r) => r.week != null).map((r) => r.week));
  const totalWeeks = weeks.size;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const entriesThisWeek = rows.filter((r) => {
    const d = new Date(r.date);
    return d >= startOfWeek;
  }).length;

  res.json(
    GetEntryStatsResponse.parse({
      totalEntries,
      currentStreak,
      longestStreak,
      totalWeeks,
      entriesThisWeek,
    }),
  );
});

// GET /entries/recent — last 7 days of entries for authenticated user
router.get("/entries/recent", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(desc(entriesTable.date));

  const filtered = rows.filter((r) => r.date >= cutoff);
  res.json(GetRecentEntriesResponse.parse(filtered.map(serializeRow)));
});

// POST /entries/rewrite — AI rewrite of raw activity using OpenAI via Replit AI integration
// Supports two modes: "concise" (2-3 sentences) and "detailed" (4-6 sentences)
router.post("/entries/rewrite", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = RewriteEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, week, mode = "concise" } = parsed.data;

  // Sanitize and limit raw input to prevent prompt injection
  const rawActivity = parsed.data.rawActivity
    .slice(0, 1000)
    .replace(/[<>]/g, "")
    .trim();

  if (rawActivity.length < 5) {
    res.status(400).json({ error: "Activity description is too short." });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const weekInfo = week ? `Week ${week} of SIWES` : "during SIWES";
  const dateInfo = date ? `on ${date}` : "";

  const modeInstruction =
    mode === "detailed"
      ? `Write 4 to 6 sentences. Cover what was done, any tools or processes involved, what was learned or observed, and why it mattered. Natural, not templated.`
      : `Write 2 to 3 sentences. Be specific about what was done. Natural and professional — not stiff or corporate.`;

  const prompt = `You write SIWES (Student Industrial Work Experience Scheme) logbook entries for Nigerian university students undergoing industrial training.

${modeInstruction}

Style rules:
- First person, past tense
- No bullet points, headers, or lists — flowing prose only
- Avoid hollow filler phrases like "invaluable experience", "gained exposure to", "a plethora of"
- If the student mentions tools, systems, or processes, name them specifically
- Sound like a real student writing in their logbook, not a corporate report
- Keep it grounded — don't exaggerate or over-formalize what happened

Context: The student was working ${weekInfo} ${dateInfo}.

Student's raw notes:
"${rawActivity}"

Write the logbook entry now. Nothing else.`;

  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const rewrittenEntry = completion.choices[0]?.message?.content?.trim() ?? rawActivity;

  res.json(RewriteEntryResponse.parse({ rewrittenEntry }));
});

// GET /entries/:id — fetch a single entry (must belong to authenticated user)
router.get("/entries/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = GetEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.id, params.data.id), eq(entriesTable.userId, userId)));

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.json(GetEntryResponse.parse(serializeRow(entry)));
});

// PATCH /entries/:id — update an entry (must belong to authenticated user)
router.patch("/entries/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .update(entriesTable)
    .set(parsed.data)
    .where(and(eq(entriesTable.id, params.data.id), eq(entriesTable.userId, userId)))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.json(UpdateEntryResponse.parse(serializeRow(entry)));
});

// DELETE /entries/:id — permanently delete an entry (must belong to authenticated user)
router.delete("/entries/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = DeleteEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(entriesTable)
    .where(and(eq(entriesTable.id, params.data.id), eq(entriesTable.userId, userId)))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.sendStatus(204);
});

// POST /entries/weekly-summary — generate a weekly summary from entries using AI
router.post("/entries/weekly-summary", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const { week } = req.body;

  if (!week || isNaN(parseInt(week, 10))) {
    res.status(400).json({ error: "Week number is required" });
    return;
  }

  const weekEntries = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.userId, userId), eq(entriesTable.week, parseInt(week, 10))))
    .orderBy(entriesTable.date);

  if (!weekEntries.length) {
    res.status(404).json({ error: "No entries found for this week" });
    return;
  }

  const entriesText = weekEntries
    .map((e, i) => `Day ${i + 1} (${e.dayOfWeek || e.date}): ${e.rewrittenEntry || e.rawActivity}`)
    .join("\n\n");

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = `You write professional SIWES (Student Industrial Work Experience Scheme) weekly summary reports for Nigerian university students.

Here are the student's daily logbook entries for Week ${week}:

${entriesText}

Write a cohesive, professional weekly summary (3-5 paragraphs) that:
- Synthesises the week's activities into a coherent narrative
- Highlights key tasks completed, skills applied, and tools used
- Mentions any challenges encountered and how they were resolved
- Reflects on learning outcomes for the week
- Sounds professional but natural — not robotic or hollow
- Is written in first person

Output only the summary text, no headers, no labels.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ summary, week: parseInt(week, 10), entryCount: weekEntries.length });
  } catch (err: any) {
    console.error("[WEEKLY_SUMMARY_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to generate summary. Please try again." });
  }
});

// POST /entries/chat — AI chat assistant for SIWES questions (proxied through backend)
router.post("/entries/chat", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Messages array is required" });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const systemPrompt = `You are AcademiQ's AI assistant — a helpful, friendly, and knowledgeable guide for Nigerian university students going through SIWES (Student Industrial Work Experience Scheme).

You help students with:
- Writing and improving their logbook entries
- Understanding SIWES requirements and best practices
- Career advice related to their industrial training
- Answering questions about logbook structure, format, and submission
- Motivating students to stay consistent with their daily logs

You are warm, encouraging, and conversational. You speak plainly — no unnecessary jargon. You understand the Nigerian university system and the specific challenges SIWES students face. Keep responses concise but helpful — 2-4 paragraphs max unless more detail is needed.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Sorry, I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (err: any) {
    console.error("[CHAT_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to get response. Please try again." });
  }
});

// POST /entries/quality-score — AI quality score for a logbook entry (proxied through backend)
router.post("/entries/quality-score", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { entryText } = req.body;

  if (!entryText || typeof entryText !== "string" || entryText.trim().length < 10) {
    res.status(400).json({ error: "entryText is required and must be at least 10 characters" });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = `You are an expert SIWES logbook evaluator for Nigerian university students. Score this logbook entry and return ONLY valid JSON with no markdown, no explanation.

Score each dimension 1-10 and return exactly this structure:
{"overall":<1-10>,"clarity":<1-10>,"detail":<1-10>,"professionalism":<1-10>,"relevance":<1-10>,"feedback":"<one sentence overall feedback>","suggestions":["<suggestion 1>","<suggestion 2>"]}

Entry: "${entryText.substring(0, 800)}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const score = JSON.parse(clean);
    res.json(score);
  } catch (err: any) {
    console.error("[QUALITY_SCORE_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to score entry. Please try again." });
  }
});

export default router;
