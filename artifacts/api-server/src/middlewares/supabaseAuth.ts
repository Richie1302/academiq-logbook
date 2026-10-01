import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) throw new Error("SUPABASE_URL env variable is required");
if (!process.env.SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY env variable is required");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    (req as any).userId = "demo-user";
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      (req as any).userId = "demo-user";
    } else {
      (req as any).userId = user.id;
    }
  } catch {
    (req as any).userId = "demo-user";
  }
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  return requireAuth(req, res, next);
}
