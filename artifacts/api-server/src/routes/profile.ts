import { requireAuth } from "../middlewares/supabaseAuth";
// Database: PostgreSQL via Drizzle ORM (@workspace/db)
// Authentication: Clerk JWT — requireAuth extracts userId from Clerk session
// Data storage: user profiles stored in `profiles` table, keyed by userId (primary key)
// Upsert logic: PUT /profile creates a new profile or updates the existing one atomically

import { Router, type IRouter, type Request, type Response } from "express";

import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { GetProfileResponse, UpsertProfileBody } from "@workspace/api-zod";

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

  let profile;
  try {
    const result = await db
      .insert(profilesTable)
      .values({ userId, ...parsed.data })
      .onConflictDoUpdate({
        target: profilesTable.userId,
        set: { ...parsed.data, updatedAt: new Date() },
      })
      .returning();
    profile = result[0];
  } catch (err: any) {
    console.error("Profile upsert error:", err?.message, err?.cause);
    res.status(500).json({ error: err?.message || "Failed to save profile" });
    return;
  }

  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

export default router;
