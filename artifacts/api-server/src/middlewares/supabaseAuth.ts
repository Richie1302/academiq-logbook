import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    // Supabase JWTs are signed with the raw secret string, not base64 decoded
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as any;
    (req as any).userId = decoded.sub as string;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ error: "Invalid token" });
  }
}
