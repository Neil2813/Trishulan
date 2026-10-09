import "./lib/env";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { extractUserMiddleware } from "./middleware/authMiddleware";

import helloRouter            from "./routes/hello";
import authRouter             from "./routes/auth";
import listingsRouter         from "./routes/listings";
import rfqRouter              from "./routes/rfq";
import chatRouter             from "./routes/chat";
import marketRouter           from "./routes/market";
import subscriptionRouter     from "./routes/subscription";
import kycRouter              from "./routes/kyc";
import platformARouter        from "./routes/platformA";
import platformBRouter        from "./routes/platformB";
import platformCRouter        from "./routes/platformC";
import platformDRouter        from "./routes/platformD";
import platformERouter        from "./routes/platformE";
import businessServicesRouter from "./routes/businessServices";
import buyerPreferencesRouter from "./routes/buyerPreferences";
import featureExpansionRouter from "./routes/featureExpansion";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./lib/db";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication requests, please try again later." }
});

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use(extractUserMiddleware);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/hello",            helloRouter);
app.use("/api/auth",             authRouter);
app.use("/api/listings",         listingsRouter);
app.use("/api/rfq",              rfqRouter);
app.use("/api/chat",             chatRouter);
app.use("/api/market",           marketRouter);
app.use("/api/subscription",     subscriptionRouter);
app.use("/api/kyc",              kycRouter);
app.use("/api/platform-a",       platformARouter);
app.use("/api/platform-b",       platformBRouter);
app.use("/api/platform-c",       platformCRouter);
app.use("/api/platform-d",       platformDRouter);
app.use("/api/platform-e",       platformERouter);
app.use("/api/business-services", businessServicesRouter);
app.use("/api/buyer-preferences", buyerPreferencesRouter);
app.use("/api/feature-expansion", featureExpansionRouter);
app.use("/api/discovery",        featureExpansionRouter);
app.use("/api/customer",         buyerPreferencesRouter);

// ── Health checks ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "OK", message: "Trishulan Express + PostgreSQL Backend" });
});

app.get("/health/deep", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "HEALTHY",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: "OK",
      }
    });
  } catch (err: any) {
    res.status(500).json({ status: "UNHEALTHY", error: err.message });
  }
});

// ── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
);

import http from "http";
import { initSocketServer } from "./services/socketService";

const server = http.createServer(app);
initSocketServer(server);

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡  Trishulan Backend  →  http://localhost:${PORT}`);
    console.log(`🔌  WebSockets        →  Socket.io Enabled`);
    console.log(`🐘  Database          →  PostgreSQL (Prisma)`);
    console.log(`====================================================`);
  });
}

export default app;
