import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
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

const requireAuth = (req: Request, res: Response, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).userId = userId as string;
  next();
};

// GET /entries
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

  res.json(ListEntriesResponse.parse(rows));
});

// POST /entries
router.post("/entries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .insert(entriesTable)
    .values({ ...parsed.data, userId })
    .returning();

  res.status(201).json(GetEntryResponse.parse(entry));
});

// GET /entries/stats
router.get("/entries/stats", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const rows = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(desc(entriesTable.date));

  const totalEntries = rows.length;

  // Calculate current streak (consecutive days)
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

  // Calculate longest streak
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

// GET /entries/recent
router.get("/entries/recent", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.userId, userId)))
    .orderBy(desc(entriesTable.date));

  const filtered = rows.filter((r) => r.date >= cutoff);
  res.json(GetRecentEntriesResponse.parse(filtered));
});

// GET /entries/rewrite (must come before /entries/:id)
router.post("/entries/rewrite", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = RewriteEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { rawActivity, date, week } = parsed.data;

  const openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  });

  const weekInfo = week ? `Week ${week} of SIWES` : "SIWES training";
  const dateInfo = date ? `Date: ${date}` : "";

  const prompt = `You are an expert at writing professional SIWES (Student Industrial Work Experience Scheme) logbook entries for Nigerian university students.

Convert the following raw activity description into a formal, detailed, and professional SIWES logbook entry. The entry should:
- Be written in first person, past tense
- Use formal, professional language appropriate for an academic logbook
- Expand on the activity with relevant technical details and context
- Be structured clearly with what was done, how it was done, and what was learned
- Be 2-4 sentences long, concise but detailed
- NOT use bullet points — write in flowing paragraphs

Context: ${weekInfo}. ${dateInfo}

Raw activity: "${rawActivity}"

Write only the logbook entry text, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const rewrittenEntry = completion.choices[0]?.message?.content?.trim() ?? rawActivity;

  res.json(RewriteEntryResponse.parse({ rewrittenEntry }));
});

// GET /entries/:id
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

  res.json(GetEntryResponse.parse(entry));
});

// PATCH /entries/:id
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

  res.json(UpdateEntryResponse.parse(entry));
});

// DELETE /entries/:id
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

export default router;
