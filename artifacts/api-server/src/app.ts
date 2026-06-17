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
  'http://localhost:5173',
];

app.use(helmet());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General API rate limit: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict AI rewrite limit: 20 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rewrite rate limit exceeded. Please wait before trying again." },
});

app.use("/api", apiLimiter);
app.use("/api/entries/rewrite", aiLimiter);
app.use("/api/entries/weekly-summary", aiLimiter);
app.use("/api/entries/chat", aiLimiter);
app.use("/api/entries/quality-score", aiLimiter);
app.use("/api", router);

// Global error handler — MUST be registered AFTER all routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err: err.message }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
