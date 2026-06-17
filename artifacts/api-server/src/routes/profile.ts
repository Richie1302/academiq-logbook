import { requireAuth } from "../middlewares/supabaseAuth";
import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
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

// Only select the columns GetProfileResponse expects — avoids crashing if
// supervisor_token column hasn't been migrated to the live DB yet
const safeProfileSelect = {
  userId: profilesTable.userId,
  fullName: profilesTable.fullName,
  email: profilesTable.email,
  school: profilesTable.school,
  course: profilesTable.course,
  siwesCompany: profilesTable.siwesCompany,
  department: profilesTable.department,
  siwesDuration: profilesTable.siwesDuration,
  createdAt: profilesTable.createdAt,
  updatedAt: profilesTable.updatedAt,
};

// GET /profile — retrieve the authenticated user's profile (404 if not yet created)
router.get("/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const [profile] = await db
    .select(safeProfileSelect)
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
      .returning(safeProfileSelect);
    profile = result[0];
  } catch (err: any) {
    console.error("[PROFILE_UPSERT_ERROR]", err?.message, err?.code);
    res.status(500).json({ error: "Failed to save profile. Please try again." });
    return;
  }

  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

// POST /profile/supervisor-token — generate or regenerate supervisor access token
// NOTE: requires supervisor_token column to exist in DB
// Run this SQL in Supabase if not exists:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supervisor_token TEXT;
router.post("/profile/supervisor-token", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const token = crypto.randomBytes(32).toString("hex");

  try {
    // Use raw SQL to safely add supervisor_token — avoids ORM column reference issues
    await db.execute(
      sql`INSERT INTO profiles (user_id, supervisor_token, created_at, updated_at)
          VALUES (${userId}, ${token}, NOW(), NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET supervisor_token = ${token}, updated_at = NOW()`
    );
    res.json({ token });
  } catch (err: any) {
    console.error("[SUPERVISOR_TOKEN_ERROR]", err?.message, err?.code);
    // Column might not exist yet — return helpful error
    if (err?.message?.includes("column") && err?.message?.includes("supervisor_token")) {
      res.status(503).json({ error: "Supervisor link feature requires a database update. Please contact support." });
    } else {
      res.status(500).json({ error: "Failed to generate supervisor link. Please try again." });
    }
  }
});

// GET /supervisor/:token — public route, no auth required — supervisor read-only view
router.get("/supervisor/:token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  if (!token || token.length < 16) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  let profile: any;
  try {
    // Raw SQL to avoid ORM referencing supervisor_token column if not migrated
    const result = await db.execute(
      sql`SELECT user_id, full_name, school, course, siwes_company, department, siwes_duration
          FROM profiles WHERE supervisor_token = ${token} LIMIT 1`
    );
    profile = result.rows?.[0];
  } catch (err: any) {
    console.error("[SUPERVISOR_PORTAL_ERROR]", err?.message);
    res.status(500).json({ error: "Failed to load logbook." });
    return;
  }

  if (!profile) {
    res.status(404).json({ error: "Logbook not found. The link may have expired or been revoked." });
    return;
  }

  const entries = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, profile.user_id))
    .orderBy(entriesTable.date);

  res.json({
    profile: {
      fullName: profile.full_name,
      school: profile.school,
      course: profile.course,
      siwesCompany: profile.siwes_company,
      department: profile.department,
      siwesDuration: profile.siwes_duration,
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
