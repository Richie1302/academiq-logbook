import { requireAuth } from "../middlewares/supabaseAuth";
import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, entriesTable } from "@workspace/db";
import { GetProfileResponse, UpsertProfileBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

// Convert Drizzle Date objects to ISO strings before Zod parses the response
function serializeRow<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v]),
  ) as T;
}


// GET /profile — retrieve the authenticated user's profile (404 if not yet created)
router.get("/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  if (!profile) {
    res.set("Cache-Control", "no-store");
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.set("Cache-Control", "no-store");

  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

// PUT /profile — create or update the authenticated user's profile (upsert)
router.put("/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, email, school, course, siwesCompany, department, siwesDuration } = parsed.data;
  let profile;
  try {
    const result = await db
      .insert(profilesTable)
      .values({ userId, fullName, email, school, course, siwesCompany, department, siwesDuration })
      .onConflictDoUpdate({
        target: profilesTable.userId,
        set: { fullName, email, school, course, siwesCompany, department, siwesDuration, updatedAt: new Date() },
      })
      .returning();
    profile = result[0];
  } catch (err: any) {
    console.error("[PROFILE_UPSERT_ERROR]", err?.message, err?.code);
    res.status(500).json({ error: "Failed to save profile. Please try again." });
    return;
  }

  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

// POST /profile/supervisor-token — generate or regenerate supervisor access token
router.post("/profile/supervisor-token", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const token = crypto.randomBytes(32).toString("hex");

  try {
    // Use upsert so it works even if profile row doesn't exist yet
    await db
      .insert(profilesTable)
      .values({ userId, supervisorToken: token })
      .onConflictDoUpdate({
        target: profilesTable.userId,
        set: { supervisorToken: token, updatedAt: new Date() },
      });

    res.json({ token });
  } catch (err: any) {
    console.error("[SUPERVISOR_TOKEN_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to generate supervisor link. Please try again." });
  }
});

// GET /supervisor/:token — public route, no auth required — supervisor read-only view
router.get("/supervisor/:token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  if (!token || token.length < 16) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.supervisorToken, token));

  if (!profile) {
    res.status(404).json({ error: "Logbook not found. The link may have expired or been revoked." });
    return;
  }

  const entries = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, profile.userId))
    .orderBy(entriesTable.date);

  res.json({
    profile: {
      fullName: profile.fullName,
      school: profile.school,
      course: profile.course,
      siwesCompany: profile.siwesCompany,
      department: profile.department,
      siwesDuration: profile.siwesDuration,
    },
    entries: entries.map(e => ({
      id: e.id,
      date: e.date,
      dayOfWeek: e.dayOfWeek,
      week: e.week,
      rewrittenEntry: e.rewrittenEntry,
      rawActivity: e.rawActivity,
    })),
  });
});

export default router;
