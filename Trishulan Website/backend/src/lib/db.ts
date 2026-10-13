import "./env";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL || !/^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL)) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
}

const logLevels: ("query" | "error" | "warn")[] =
  process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

export const prisma =
  global.__prisma ?? new PrismaClient({ log: logLevels });

export function isDatabaseConnectionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code =
    "code" in error && typeof error.code === "string"
      ? error.code
      : "errorCode" in error && typeof error.errorCode === "string"
        ? error.errorCode
        : undefined;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  return (
    (code !== undefined && ["P1000", "P1001", "P1002", "P1010"].includes(code)) ||
    /authentication failed against database server|can't reach database server|database server.*(?:unreachable|timed out)/i.test(message)
  );
}

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
