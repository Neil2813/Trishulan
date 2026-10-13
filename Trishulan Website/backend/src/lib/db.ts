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

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
