import { requireAuth } from "../middlewares/supabaseAuth";
// Authentication: Clerk JWT â€” every route requires a valid session via requireAuth middleware
// Data storage: entries stored in `entries` table, scoped by userId from Clerk auth

import { Router, type IRouter, type Request, type Response } from "express";

import { eq, and, desc, inArray } from "drizzle-orm";
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
import { SIWES_REPORT_TEMPLATES } from "../lib/templates/siwesReportExemplars";

const router: IRouter = Router();

// Convert Drizzle Date objects to ISO strings before Zod parses the response
function serializeRow<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v]),
  ) as T;
}

const TEXT_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "groq/compound",
  "groq/compound-mini",
];

const VISION_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
];

async function createGroqCompletion(openai: OpenAI, payload: any, isVision = false) {
  const models = isVision ? VISION_MODELS : TEXT_MODELS;
  let lastError: any = null;

  for (const model of models) {
    try {
      return await openai.chat.completions.create({
        ...payload,
        model,
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`[GROQ_FALLBACK] Model ${model} failed or decommissioned: ${err?.message}. Trying next fallback model...`);
    }
  }
  throw lastError || new Error("All Groq models failed.");
}


// GET /entries â€” list entries for authenticated user (optionally filtered by date/week/month)
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

// POST /entries â€” create a new logbook entry linked to authenticated user
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

// GET /entries/stats â€” aggregate stats for authenticated user's entries
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

// GET /entries/recent â€” last 7 days of entries for authenticated user
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

// POST /entries/rewrite â€” AI rewrite of raw activity using OpenAI via Replit AI integration
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
      : `Write 2 to 3 sentences. Be specific about what was done. Natural and professional â€” not stiff or corporate.`;

  const prompt = `You write SIWES (Student Industrial Work Experience Scheme) logbook entries for Nigerian university students undergoing industrial training.

${modeInstruction}

Style rules:
- First person, past tense
- No bullet points, headers, or lists â€” flowing prose only
- Avoid hollow filler phrases like "invaluable experience", "gained exposure to", "a plethora of"
- If the student mentions tools, systems, or processes, name them specifically
- Sound like a real student writing in their logbook, not a corporate report
- Keep it grounded â€” don't exaggerate or over-formalize what happened

Context: The student was working ${weekInfo} ${dateInfo}.

Student's raw notes:
"${rawActivity}"

Write the logbook entry now. Nothing else.`;

  const completion: any = await createGroqCompletion(openai, {
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const rewrittenEntry = completion.choices[0]?.message?.content?.trim() ?? rawActivity;

  res.json(RewriteEntryResponse.parse({ rewrittenEntry }));
});


// GET /entries/report-data â€” Get compiled data for SIWES Technical Report generation
// NOTE: must be declared BEFORE /entries/:id to avoid Express matching "report-data" as an :id
router.get("/entries/report-data", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;

  let rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(entriesTable.date);

  if (rows.length === 0) {
    rows = await db.select().from(entriesTable).orderBy(entriesTable.date);
  }

  // Group entries by week
  const weeksMap: Record<number, any[]> = {};
  rows.forEach(r => {
    const w = r.week ?? 1;
    if (!weeksMap[w]) weeksMap[w] = [];
    weeksMap[w].push(serializeRow(r));
  });

  res.json({
    totalEntries: rows.length,
    weeksCount: Object.keys(weeksMap).length,
    weeks: weeksMap,
    allEntries: rows.map(serializeRow)
  });
});

// POST /entries/report-generate-chapters -- must also be before /:id
router.post("/entries/report-generate-chapters", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const { companyName, department, institution, targetPageCount = 10, detailLevel = "detailed", templateStyle = "geotechnical" } = req.body;

  let rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(entriesTable.date);

  if (rows.length === 0) {
    rows = await db.select().from(entriesTable).orderBy(entriesTable.date);
  }

  if (rows.length === 0) {
    res.status(400).json({ error: "No logbook entries found in history. Please add or import your daily logbook entries first before generating a technical report." });
    return;
  }

  const activitiesSummary = rows.map(r => `Week ${r.week ?? 1}: ${r.rawActivity}`).join("\n").slice(0, 8000);
  const selectedExemplar = SIWES_REPORT_TEMPLATES[templateStyle] || SIWES_REPORT_TEMPLATES.geotechnical;

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const scrub = (str?: string) =>
    str
      ? str.replace(/\*+/g, "").replace(/[\u2013\u2014\u2012]/g, "-").replace(/[\u2018\u2019]/g, "'").trim()
      : "";

  const ctxCompany = companyName || "Industrial Establishment";
  const ctxDept = department || "Engineering / Applied Sciences";
  const ctxInst = institution || "University / Polytechnic";

  // === CALL 1: Front matter + Chapters 1 & 2 (shorter content) ===
  const prompt1 = `You are a technical report writer for Nigerian university SIWES reports.
Generate ONLY the following sections as a valid JSON object. Do NOT truncate. Complete all fields fully.

Formatting Rule: Major Chapter Headings are ALL CAPS. All subheadings (e.g. 1.1 Introduction, 1.2 Historical Background of SIWES, 2.1 History and Activities of the Company) MUST use Title Case (Capitalize First Letter Of Each Word).

Student context:
- Company: ${ctxCompany}
- Department: ${ctxDept}
- Institution: ${ctxInst}
- Logbook activities: ${activitiesSummary.slice(0, 3000)}

Return ONLY this JSON (no markdown, no explanation):
{
  "dedication": "One short paragraph dedicating the report to God Almighty, parents, and family.",
  "acknowledgement": "Three paragraphs: (1) gratitude to God, (2) gratitude to company management and supervisor, (3) gratitude to university SIWES coordinator and ITF and family.",
  "abstract": "Two paragraphs summarizing the SIWES attachment at ${ctxCompany}, key technical tasks performed, skills gained, and conclusion.",
  "certification": "Two-sentence formal certification that the six-month industrial training was carried out by the student under supervision.",
  "chapter1Background": "Four subsections: 1.1 Introduction (2 paragraphs on SIWES purpose), 1.2 Historical Background of SIWES (ITF Act 1971, established 1973), 1.3 Aims and Objectives of SIWES (numbered list of 6 objectives), 1.4 Importance and Benefits of SIWES (numbered list of 5 benefits).",
  "chapter2Overview": "Four subsections: 2.1 History and Activities of ${ctxCompany} (2 paragraphs), 2.2 Mission and Vision, 2.3 Core Values (list: Integrity, Innovation, Excellence, Teamwork, Professionalism), 2.4 Structure and Organogram (describe departments)."
}`;

  // === CALL 2: Chapters 3 & 4 (heavy content) ===
  const prompt2 = `You are a technical report writer for Nigerian university SIWES reports.
Generate ONLY the following sections as a valid JSON object. Do NOT truncate. Complete all fields fully.

Formatting Rule: All subheadings (e.g. 3.1 Tools and Technologies Used, 3.2 Technical Concepts, 3.3.1 Web Development Project, 4.1 Summary of Activities, 4.2 Challenges Encountered, 4.3 Recommendations, 4.4 Conclusion) MUST use Title Case (Capitalize First Letter Of Each Word).

Student context:
- Company: ${ctxCompany}
- Department: ${ctxDept}
- Logbook activities summary: ${activitiesSummary.slice(0, 5000)}

Return ONLY this JSON (no markdown, no explanation):
{
  "chapter3Narrative": "Three subsections based on the actual logbook activities above: 3.1 Tools and Technologies Used (list hardware, software, equipment encountered), 3.2 Technical Concepts (numbered list of 6-8 technical concepts learned with brief explanations), 3.3 Projects Completed (sub-projects 3.3.1 through 3.3.4 each describing a specific task or project from the logbook in Title Case with 2-3 sentences).",
  "chapter4Challenges": "Four subsections: 4.1 Summary of Activities (2 paragraphs summarising the entire training period), 4.2 Challenges Encountered (5 specific challenges with brief explanation each), 4.3 Recommendations (numbered list of 6 recommendations addressed to the institution, ITF, and employer), 4.4 Conclusion (one strong closing paragraph).",
  "references": "Four APA-format references relevant to SIWES, technical engineering/IT, and the ITF."
}`;

  try {
    const [completion1, completion2] = await Promise.all([
      createGroqCompletion(openai, {
        messages: [{ role: "user", content: prompt1 }],
        max_tokens: 2800,
        temperature: 0.3,
      }),
      createGroqCompletion(openai, {
        messages: [{ role: "user", content: prompt2 }],
        max_tokens: 3500,
        temperature: 0.3,
      }),
    ]);

    const raw1 = (completion1 as any).choices[0]?.message?.content?.trim() ?? "{}";
    const raw2 = (completion2 as any).choices[0]?.message?.content?.trim() ?? "{}";
    console.log("[REPORT_CH1_RAW] Last 100:", raw1.slice(-100));
    console.log("[REPORT_CH2_RAW] Last 100:", raw2.slice(-100));

    const parseJson = (raw: string): any => {
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      try { return JSON.parse(cleaned); } catch {}
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) { try { return JSON.parse(m[0]); } catch {} }
      // Truncation repair: add closing braces
      const fb = cleaned.indexOf("{");
      if (fb !== -1) {
        let attempt = cleaned.slice(fb);
        for (let i = 0; i < 8; i++) { attempt += '"}'; try { return JSON.parse(attempt); } catch {} }
        for (let i = 0; i < 3; i++) { attempt += "}"; try { return JSON.parse(attempt); } catch {} }
      }
      return null;
    };

    const ch1 = parseJson(raw1);
    const ch2 = parseJson(raw2);

    if (!ch1 && !ch2) {
      console.error("[REPORT_PARSE_FAIL] Both calls failed to parse");
      res.status(422).json({ error: "Could not parse AI report content. Please try again." });
      return;
    }

    res.json({
      dedication: scrub(ch1?.dedication),
      acknowledgement: scrub(ch1?.acknowledgement),
      abstract: scrub(ch1?.abstract),
      certification: scrub(ch1?.certification),
      chapter1Background: scrub(ch1?.chapter1Background),
      chapter2Overview: scrub(ch1?.chapter2Overview),
      chapter3Narrative: scrub(ch2?.chapter3Narrative),
      chapter4Challenges: scrub(ch2?.chapter4Challenges),
      chapter5Conclusion: "",
      references: scrub(ch2?.references),
    });
  } catch (err: any) {
    console.error("[REPORT_CHAPTERS_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to generate report chapters. Please try again." });
  }
});
// GET /entries/:id â€” fetch a single entry (must belong to authenticated user)
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

// PATCH /entries/:id â€” update an entry (must belong to authenticated user)
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

// DELETE /entries/:id â€” permanently delete an entry (must belong to authenticated user)
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

// POST /entries/bulk-delete â€” permanently delete multiple entries (must belong to authenticated user)
router.post("/entries/bulk-delete", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "No entry IDs provided" });
    return;
  }

  const numericIds = ids.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id));
  if (numericIds.length === 0) {
    res.status(400).json({ error: "Invalid entry IDs" });
    return;
  }

  await db
    .delete(entriesTable)
    .where(and(eq(entriesTable.userId, userId), inArray(entriesTable.id, numericIds)));

  res.json({ success: true, deletedCount: numericIds.length });
});

// POST /entries/weekly-summary â€” generate a weekly summary from entries using AI
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
- Sounds professional but natural â€” not robotic or hollow
- Is written in first person

Output only the summary text, no headers, no labels.`;

  try {
    const completion: any = await createGroqCompletion(openai, {
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

// POST /entries/chat â€” AI chat assistant for SIWES questions (proxied through backend)
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

  const systemPrompt = `You are AcademiQ's in-app chat assistant helping Nigerian university students with their SIWES (Student Industrial Work Experience Scheme) logbook and internship experience.

You help with things like writing logbook entries, understanding SIWES requirements, dealing with difficult supervisors, formatting reports, and staying consistent with daily logs.

VERY IMPORTANT â€” how to write your replies:
- Write like a knowledgeable friend texting back, not like a formal document or a teacher
- No asterisks, no bold, no bullet points, no numbered lists with bold headers, no markdown of any kind
- No em dashes (â€”), no colons introducing lists, no "Here are X steps:"
- Do not start sentences with "Certainly!", "Absolutely!", "Great question!" or similar AI filler phrases
- Keep it short and real â€” 2 to 4 short paragraphs is enough. Don't over-explain
- If you need to list things, write them as part of a sentence or use plain line breaks, not formatted lists
- Sound like someone who has done SIWES before and genuinely wants to help, not a chatbot running a script
- Use simple, direct Nigerian-student-friendly language. A little casual is fine.`;


  try {
    const completion: any = await createGroqCompletion(openai, {
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "Sorry, I couldn't generate a response. Please try again.";

    // Strip any markdown the model sneaks through despite instructions
    const reply = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")   // remove bold **text**
      .replace(/\*(.*?)\*/g, "$1")        // remove italic *text*
      .replace(/â€”/g, "-")                 // replace em dash with regular dash
      .replace(/â€“/g, "-")                 // replace en dash
      .replace(/\n{3,}/g, "\n\n")         // collapse excessive blank lines
      .trim();

    res.json({ reply });

  } catch (err: any) {
    console.error("[CHAT_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to get response. Please try again." });
  }
});

// POST /entries/generic-check â€” AI detects generic/clichÃ©d phrases in a logbook entry
router.post("/entries/generic-check", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { entryText } = req.body;

  if (!entryText || typeof entryText !== "string" || entryText.trim().length < 10) {
    res.status(400).json({ error: "entryText is required and must be at least 10 characters" });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = `You are an expert reviewer of Nigerian university SIWES (Student Industrial Work Experience Scheme) logbook entries. Your job is to detect overly generic, clichÃ©d, or copy-paste-sounding language that lacks personal authenticity.

Analyze the entry below and return ONLY valid JSON with no markdown, no explanation, in exactly this structure:
{
  "genericityScore": <0-100, where 0 = completely original/personal, 100 = completely generic/copy-paste>,
  "verdict": "<one of: 'Original', 'Slightly Generic', 'Very Generic', 'Copy-Paste Risk'>",
  "flaggedPhrases": ["<exact phrase from the entry that is generic>", ...],
  "suggestions": ["<specific rewrite suggestion for each flagged phrase>", ...],
  "summary": "<one sentence overall assessment>"
}

Common Nigerian SIWES clichÃ©s to watch for (but don't limit to these):
- "I was opportuned to", "I gained exposure to", "I was able to observe", "I was taught how to", 
- "under the supervision of my supervisor", "I learnt a lot", "it was a great experience",
- "I was introduced to", "I familiarized myself with", "the experience was enlightening",
- "I was privileged to", "I got to understand", "I was shown how to"

Entry: "${entryText.substring(0, 800)}"`;

  try {
    const completion: any = await createGroqCompletion(openai, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (err: any) {
    console.error("[GENERIC_CHECK_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to check entry. Please try again." });
  }
});

// POST /entries/quality-score â€” AI quality score for a logbook entry (proxied through backend)
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
    const completion: any = await createGroqCompletion(openai, {
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

// POST /entries/bulk-generate â€” AI generates multiple weeks of daily entries and saves to DB
router.post("/entries/bulk-generate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const {
    startWeek,
    numWeeks,
    startDate,
    company,
    department,
    supervisor,
    activities,
    format = "standard",
  } = req.body;

  if (!startWeek || !numWeeks || !startDate || !activities) {
    res.status(400).json({ error: "startWeek, numWeeks, startDate, and activities are required." });
    return;
  }

  const totalWeeks = Math.min(Math.max(parseInt(numWeeks, 10), 1), 24);
  const firstDay = new Date(startDate);

  if (isNaN(firstDay.getTime())) {
    res.status(400).json({ error: "Invalid startDate. Use YYYY-MM-DD format." });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const savedEntries: any[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekNumber = parseInt(startWeek, 10) + w;

    // Build dates for Monâ€“Fri of this week
    const weekDates = dayNames.map((_, dayIdx) => {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + w * 7 + dayIdx);
      return d.toISOString().slice(0, 10);
    });

    const formatInstruction =
      format === "structured"
        ? `For each day, write exactly in this format (keep it very short â€” fits a physical logbook line):
[Day name], [Date]
Activities: <1â€“2 short sentences of what was done>
Challenges: <1 short sentence>
Solutions: <1 short sentence>`
        : `For each day, write a single short paragraph (2â€“3 sentences max). Professional, past tense, first person. Fits on a logbook page.`;

    const weekContext = w === 0
      ? "first week (orientation, introductions, understanding the environment)"
      : w < Math.floor(totalWeeks / 2)
      ? "early weeks (getting assigned to real tasks, learning workflows)"
      : w < totalWeeks - 1
      ? "mid-to-late weeks (taking on more responsibilities, solving problems independently)"
      : "final week (wrapping up, completing documentation, reviewing work done)";

    const prompt = `You generate SIWES (Student Industrial Work Experience Scheme) logbook entries for Nigerian university students.

Generate 5 daily entries for Week ${weekNumber} of SIWES training (${weekContext}).

Details:
- Company/Organisation: ${company || "the company"}
- Department: ${department || "the department"}
- Supervisor: ${supervisor || "the supervisor"}
- General activities done during training: ${activities.slice(0, 500)}

${formatInstruction}

Rules:
- Keep each day entry SHORT â€” maximum 60 words per day
- Vary the activities realistically across the 5 days â€” no copy-paste repetition
- First person, past tense
- Sound like a real student, not a corporate document
- No extra commentary â€” just the 5 daily entries, one per line block

Output exactly 5 entries labelled Day 1 through Day 5. Nothing else.`;

    try {
      const completion: any = await createGroqCompletion(openai, {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.75,
      });

      const rawOutput = completion.choices[0]?.message?.content?.trim() ?? "";

      // Split by "Day N" markers
      const dayBlocks = rawOutput.split(/\bDay\s+\d+[:\-]?\s*/i).filter(Boolean);

      for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
        const entryText = dayBlocks[dayIdx]?.trim() ?? "";
        if (!entryText) continue;

        const date = weekDates[dayIdx];
        const dayOfWeek = dayNames[dayIdx];

        const [saved] = await db
          .insert(entriesTable)
          .values({
            userId,
            date,
            rawActivity: activities.slice(0, 500),
            rewrittenEntry: entryText,
            week: weekNumber,
            dayOfWeek,
          })
          .returning();

        if (saved) savedEntries.push(serializeRow(saved));
      }
    } catch (err: any) {
      console.error(`[BULK_GENERATE_ERROR] Week ${weekNumber}:`, err?.message);
      // Continue to next week rather than aborting everything
    }
  }

  res.status(201).json({ entries: savedEntries, totalGenerated: savedEntries.length });
});

// POST /entries/photo-vision â€” Analyze workplace image (base64) & auto-draft SIWES entry
router.post("/entries/photo-vision", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { imageBase64, userNotes } = req.body;

  if (!imageBase64) {
    res.status(400).json({ error: "Image data (base64) is required." });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const promptText = `Analyze this workplace/technical image from a SIWES (Student Industrial Work Experience Scheme) student's internship activity.
${userNotes ? `Additional user context: "${userNotes}"` : ""}

Generate a high-quality, professional SIWES logbook entry describing what was done.
Output MUST be valid JSON with this exact schema:
{
  "title": "Short title (5-8 words)",
  "rawActivity": "Detailed bullet points of observed equipment, processes, tools, and tasks depicted in the image.",
  "rewrittenEntry": "A polished 2-3 sentence academic SIWES log entry written in past tense, first person.",
  "equipmentUsed": ["List of equipment, tools, software or machinery identified"],
  "keyLearnings": "1-2 sentences summarizing technical knowledge gained."
}
Return ONLY JSON, no markdown code block surrounding it.`;

    const completion: any = await createGroqCompletion(openai, {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.5,
    }, true);

    const rawOutput = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleanedJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleanedJson);
      res.json(parsed);
    } catch {
      // Fallback if parsing fails
      res.json({
        title: "Workplace Technical Activity",
        rawActivity: rawOutput.slice(0, 300),
        rewrittenEntry: rawOutput.slice(0, 300),
        equipmentUsed: ["Workplace equipment"],
        keyLearnings: "Gained practical exposure to technical operations."
      });
    }
  } catch (err: any) {
    console.error("[PHOTO_VISION_ERROR]", err?.message);
    res.json({
      title: "Workplace Operations & Equipment Inspection",
      rawActivity: "Inspected workplace technical setup, observed operational procedures, and assisted supervisor with routine system maintenance and log documentation.",
      rewrittenEntry: "Conducted routine inspection of operational equipment and assisted technical staff with system setup, diagnostic procedures, and log documentation.",
      equipmentUsed: ["Workplace technical equipment"],
      keyLearnings: "Gained practical exposure to technical operations and safety protocols."
    });
  }
});

// POST /entries/defense-coach/questions â€” Generate tailored defense interview questions based on user's actual logs
router.post("/entries/defense-coach/questions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;

  const rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(desc(entriesTable.date));

  if (rows.length === 0) {
    res.status(400).json({ error: "You need at least a few saved logbook entries to use the Defense Coach!" });
    return;
  }

  const logSummary = rows.slice(0, 15).map(r => `[Week ${r.week ?? 1} - ${r.dayOfWeek ?? "Day"}]: ${r.rewrittenEntry}`).join("\n");

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const prompt = `You are a strict, experienced Nigerian University SIWES External Defense Examiner (Professor/Industry Expert).
Review the following logbook summary of a student's internship:
${logSummary}

Generate 5 realistic, challenging oral defense examination questions that a supervisor or external panel would ask this student.
Each question must test technical depth, practical application, safety protocols, or problem-solving.

Return ONLY a valid JSON array of objects with this format:
[
  {
    "id": "q1",
    "topic": "Topic area (e.g., Database Management / Circuit Testing)",
    "question": "The specific question text",
    "context": "Context from their log entry referenced",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]
No markdown surrounding it.`;

    const completion: any = await createGroqCompletion(openai, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const rawOutput = completion.choices[0]?.message?.content?.trim() ?? "[]";
    const cleanedJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const questions = JSON.parse(cleanedJson);

    res.json({ questions });
  } catch (err: any) {
    console.error("[DEFENSE_QUESTIONS_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to generate defense questions." });
  }
});

// POST /entries/defense-coach/evaluate â€” Grade student's answer to a defense question
router.post("/entries/defense-coach/evaluate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { question, answer, topic } = req.body;

  if (!question || !answer) {
    res.status(400).json({ error: "Both question and answer are required." });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const prompt = `You are an External Examiner evaluating a student's oral answer during their SIWES Final Defense.
Topic: ${topic || "General SIWES Training"}
Question: "${question}"
Student's Answer: "${answer}"

Evaluate the student's answer thoroughly. Output MUST be valid JSON with this exact schema:
{
  "score": 75,
  "verdict": "Pass",
  "strengths": ["List of things done well"],
  "improvements": ["List of missing technical concepts or depth"],
  "modelAnswer": "An exemplary, concise 2-3 sentence model response."
}
Keep modelAnswer under 3 sentences to stay concise. Return ONLY valid JSON with no markdown code blocks and no comments.`;

    const completion: any = await createGroqCompletion(openai, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const rawOutput = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleanedJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let result: any;
    try {
      const match = cleanedJson.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : cleanedJson;
      const stripped = jsonStr.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      result = JSON.parse(stripped);
    } catch {
      result = {
        score: answer.length < 15 ? 40 : 70,
        verdict: answer.length < 15 ? "Needs Improvement" : "Pass",
        strengths: ["Provided a direct response to the examiner's question."],
        improvements: ["Elaborate with specific technical procedures, tools, and safety protocols."],
        modelAnswer: `When investigating issues like "${question.substring(0, 50)}...", start by diagnosing physical/hardware connectivity, reviewing configuration logs, using diagnostic tools, and following standard troubleshooting isolation methodology.`,
      };
    }

    res.json(result);
  } catch (err: any) {
    console.error("[DEFENSE_EVALUATE_ERROR]", err?.message);
    res.json({
      score: 50,
      verdict: "Needs Improvement",
      strengths: ["Submitted response for evaluation."],
      improvements: ["Elaborate further with technical steps and tools used."],
      modelAnswer: "Be sure to state your step-by-step diagnostic workflow clearly, referencing the specific equipment and protocols involved."
    });
  }
});








/** Robust fallback parser that maps each asterisk bullet to Monday-Friday per week with calculated dates */
function fallbackLogbookParse(rawText: string): Array<{ week: number; date: string | null; dayOfWeek: string | null; content: string }> {
  const weekBlocks = rawText.split(/(?=(?:WEEK|Week)\s*\d+)/i);
  const entries: Array<{ week: number; date: string | null; dayOfWeek: string | null; content: string }> = [];

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentYear = new Date().getFullYear();

  const monthNames: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
  };

  for (const block of weekBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const weekMatch = trimmed.match(/(?:WEEK|Week)\s*(\d+)/i);
    if (!weekMatch) continue;
    const weekNum = parseInt(weekMatch[1], 10);

    let startMonth = -1;
    let startDay = -1;

    const headerLine = trimmed.split("\n")[0] || "";
    const dateRangeMatch = headerLine.match(/([a-z]+)\s+(\d{1,2})\s*[-â€“â€”]/i);
    if (dateRangeMatch) {
      const monthStr = dateRangeMatch[1].toLowerCase();
      if (monthNames[monthStr] !== undefined) {
        startMonth = monthNames[monthStr];
        startDay = parseInt(dateRangeMatch[2], 10);
      }
    }

    const lines = trimmed.split("\n");
    const bulletContents: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^[\*\-\â€¢]\s*/.test(line)) {
        bulletContents.push(line.replace(/^[\*\-\â€¢]\s*/, "").trim());
      } else if (bulletContents.length > 0 && !/(?:WEEK|Week)/i.test(line)) {
        bulletContents[bulletContents.length - 1] += " " + line;
      }
    }

    if (bulletContents.length > 0) {
      bulletContents.forEach((content, index) => {
        if (!content.trim()) return;

        const dayOfWeek = weekdays[index % 5];
        let dateStr: string | null = null;

        if (startMonth !== -1 && startDay !== -1) {
          const d = new Date(currentYear, startMonth, startDay + index);
          dateStr = d.toISOString().slice(0, 10);
        }

        entries.push({
          week: weekNum,
          date: dateStr,
          dayOfWeek,
          content: content.trim(),
        });
      });
    }
  }

  if (entries.length === 0) {
    const rawBullets = rawText.split("\n").map(l => l.trim()).filter(l => /^[\*\-\â€¢]\s*/.test(l));
    rawBullets.forEach((b, i) => {
      entries.push({
        week: Math.floor(i / 5) + 1,
        date: null,
        dayOfWeek: weekdays[i % 5],
        content: b.replace(/^[\*\-\â€¢]\s*/, "").trim(),
      });
    });
  }

  return entries.length > 0 ? entries : [{ week: 1, date: null, dayOfWeek: "Monday", content: rawText.trim() }];
}

// POST /entries/import/parse â€” AI reads raw logbook text and returns structured entries (no DB write)
router.post("/entries/import/parse", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 20) {
    res.status(400).json({ error: "Please provide at least a few lines of logbook text." });
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `You are an expert parser for Nigerian university SIWES (Student Industrial Work Experience Scheme) logbooks.
The user pasted or uploaded their raw logbook text. Extract every individual day's entry from it.

CRITICAL RULE FOR ASTERISKS (*) AND BULLETS:
In Nigerian SIWES logbooks, under each week header (e.g. "Week 1 â€” April 6â€“10"), each asterisk (*) bullet point represents ONE INDIVIDUAL DAY of that work week:
- 1st bullet (*) -> Monday (e.g. April 6)
- 2nd bullet (*) -> Tuesday (e.g. April 7)
- 3rd bullet (*) -> Wednesday (e.g. April 8)
- 4th bullet (*) -> Thursday (e.g. April 9)
- 5th bullet (*) -> Friday (e.g. April 10)

YOU MUST SPLIT EVERY BULLET POINT (*) INTO ITS OWN SEPARATE JSON OBJECT IN THE ARRAY.
Do NOT group all bullets of a week into a single entry object.

Schema for each entry object:
{
  "week": <integer week number e.g. 1, 2, 23>,
  "date": "<YYYY-MM-DD or null if year/month completely unknown>",
  "dayOfWeek": "<Monday|Tuesday|Wednesday|Thursday|Friday>",
  "content": "<the text of that specific bullet point â€” remove leading asterisk *>"
}

Rules:
1. Strip leading asterisks (*) and bullet characters from content.
2. Keep content faithful to what the student wrote â€” preserve technical terms, site names, and activity details.
3. Calculate exact YYYY-MM-DD dates if a month and day range is given in the week header (assume year 2026 if no year given).
4. Return ONLY a valid JSON array of entry objects. No conversational text or intro.

Today's date for reference: ${today}.

Student's logbook text:
"""
${text.slice(0, 35000)}
"""`;

  try {
    let entries: any[] = [];

    try {
      const completion: any = await createGroqCompletion(openai, {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);

      if (match) {
        entries = JSON.parse(match[0]);
      }
    } catch (aiErr: any) {
      console.warn("[IMPORT_PARSE_AI_FALLBACK]", aiErr?.message);
    }

    // Fallback to regex parser if AI returns invalid JSON or empty array
    if (!Array.isArray(entries) || entries.length === 0) {
      entries = fallbackLogbookParse(text);
    }

    res.json({ entries, total: entries.length });
  } catch (err: any) {
    console.error("[IMPORT_PARSE_ERROR]", err?.message);
    const fallback = fallbackLogbookParse(text);
    res.json({ entries: fallback, total: fallback.length });
  }
});

// POST /entries/import/save â€” Bulk-save parsed entries, skipping duplicate content
router.post("/entries/import/save", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: "No entries to save." });
    return;
  }

  const existing = await db
    .select({ date: entriesTable.date, rawActivity: entriesTable.rawActivity })
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId));

  const existingDates = new Set(existing.map(r => r.date));
  const existingActivities = new Set(existing.map(r => r.rawActivity.trim().toLowerCase()));

  let saved = 0;
  let skipped = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const { week, date, dayOfWeek, content } = entry;
    if (!content?.trim()) { skipped++; continue; }

    const cleanContent = content.trim();

    // Skip if identical content already exists for this user
    if (existingActivities.has(cleanContent.toLowerCase())) {
      skipped++;
      continue;
    }

    // Determine target date
    let targetDate = date;
    if (!targetDate) {
      const d = new Date();
      if (week != null) {
        // Generate distinct dates based on week number
        d.setDate(d.getDate() - Math.max(0, (26 - week) * 7) + (i % 5));
      } else {
        d.setDate(d.getDate() - i);
      }
      targetDate = d.toISOString().slice(0, 10);
    } else if (existingDates.has(targetDate)) {
      skipped++;
      continue;
    }

    try {
      await db.insert(entriesTable).values({
        userId,
        date: targetDate,
        rawActivity: cleanContent,
        rewrittenEntry: cleanContent,
        week: week ? parseInt(String(week), 10) : null,
        dayOfWeek: dayOfWeek ?? null,
      });

      existingDates.add(targetDate);
      existingActivities.add(cleanContent.toLowerCase());
      saved++;
    } catch (err: any) {
      console.error("[IMPORT_SAVE_ROW_ERROR]", err?.message);
      skipped++;
    }
  }

  res.status(201).json({ saved, skipped, total: entries.length });
});

export default router;
