import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Supabase signs JWTs with the raw JWT secret string (not base64 decoded)
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
    (req as any).userId = decoded.sub as string;
    next();
  } catch (err) {
    console.error("JWT verification failed:", (err as Error).message);
    // Log the token header to understand what algorithm Supabase is actually using
    try {
      const header = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
      console.error("Token header:", JSON.stringify(header));
    } catch {}
    res.status(401).json({ error: "Invalid token" });
  }
}
