import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import https from "https";

const SUPABASE_URL = "https://xqbzrvcwfgqrvfelbtdr.supabase.co";
let cachedJwks: Record<string, string> = {};

function jwkToPem(jwk: any): string {
  // Use the crpto module to import JWK and export as PEM
  const { createPublicKey } = require("crypto");
  const key = createPublicKey({ key: jwk, format: "jwk" });
  return key.export({ type: "spki", format: "pem" }) as string;
}

function fetchPublicKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (cachedJwks[kid]) return resolve(cachedJwks[kid]);
    https.get(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jwks = JSON.parse(data);
          for (const key of jwks.keys) {
            if (key.kid === kid) {
              const pem = jwkToPem(key);
              cachedJwks[kid] = pem;
              return resolve(pem);
            }
          }
          reject(new Error(`Key ${kid} not found in JWKS`));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") throw new Error("Invalid token");

    const kid = decoded.header.kid as string;
    const publicKey = await fetchPublicKey(kid);

    const verified = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as jwt.JwtPayload;
    (req as any).userId = verified.sub as string;
    next();
  } catch (err) {
    console.error("JWT verification failed:", (err as Error).message);
    res.status(401).json({ error: "Invalid token" });
  }
}
