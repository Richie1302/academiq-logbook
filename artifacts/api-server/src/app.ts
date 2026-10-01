import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const ALLOWED_ORIGINS = [
  'https://academiq-logbook.vercel.app',
  'https://academiq-api-wfh3.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// CORS middleware MUST come before Helmet to properly handle preflight OPTIONS
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (
      !origin ||
      process.env.NODE_ENV !== "production" ||
      ALLOWED_ORIGINS.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

const isDev = process.env.NODE_ENV !== "production";

// General API rate limit: generous in dev, 100/15min in prod
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// AI rewrite limit: generous in dev, 20/min in prod
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded. Please wait before trying again." },
});

app.use("/api", apiLimiter);
app.use("/api/entries/rewrite", aiLimiter);
app.use("/api/entries/weekly-summary", aiLimiter);
app.use("/api/entries/chat", aiLimiter);
app.use("/api/entries/quality-score", aiLimiter);
app.use("/api", router);

// JSON 404 fallback for any unhandled /api route
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Global error handler — MUST be registered AFTER all routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err: err.message }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
