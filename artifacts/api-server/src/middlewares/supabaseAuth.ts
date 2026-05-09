import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xqbzrvcwfgqrvfelbtdr.supabase.co",
  process.env.SUPABASE_ANON_KEY!
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error("Auth error:", error?.message);
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  (req as any).userId = user.id;
  next();
}
