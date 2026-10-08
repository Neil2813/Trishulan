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

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "OK", message: "Trishulan Express + PostgreSQL Backend" });
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

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡  Trishulan Backend  →  http://localhost:${PORT}`);
    console.log(`🐘  Database          →  PostgreSQL (Prisma)`);
    console.log(`====================================================`);
  });
}

export default app;
