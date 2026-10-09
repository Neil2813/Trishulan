import "./env";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { backendDir } from "./env";

/**
 * Database selection:
 *  - DATABASE_URL set  → PostgreSQL via the standard @prisma/client.
 *  - DATABASE_URL unset → local SQLite fallback (prisma/dev.db), using a client generated
 *    from prisma/sqlite/schema.prisma by `npm run db:setup` (runs automatically on `npm run dev`).
 *
 * SQLite (Prisma 5) has no enums, scalar lists, Json, or `mode: "insensitive"`.
 * The fallback schema stores those as strings and the extension below transparently
 * (de)serialises them so route code stays identical for both databases.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const logLevels: ("query" | "error" | "warn")[] =
  process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

export const isSqliteFallback = !process.env.DATABASE_URL;

// Fields stored as JSON strings in SQLite, per model.
const JSON_FIELDS: Record<string, string[]> = {
  MarketPrice: ["history7d", "history30d", "historicalYear"],
};

function stripInsensitiveMode(value: any): any {
  if (Array.isArray(value)) return value.map(stripInsensitiveMode);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "mode" && (v === "insensitive" || v === "default")) continue; // SQLite LIKE is already case-insensitive (ASCII)
      out[k] = stripInsensitiveMode(v);
    }
    return out;
  }
  return value;
}

function serializeData(data: any, fields: string[]): any {
  if (Array.isArray(data)) return data.map((d) => serializeData(d, fields));
  if (!data || typeof data !== "object") return data;
  const out = { ...data };
  for (const f of fields) {
    if (!(f in out)) continue;
    const v = out[f];
    const raw = v && typeof v === "object" && !Array.isArray(v) && "set" in v ? v.set : v;
    out[f] = typeof raw === "string" ? raw : JSON.stringify(raw ?? []);
  }
  return out;
}

function deserializeRow(row: any, fields: string[]): any {
  if (!row || typeof row !== "object") return row;
  for (const f of fields) {
    if (typeof row[f] === "string") {
      try { row[f] = JSON.parse(row[f]); } catch { /* leave as-is */ }
    }
  }
  return row;
}

function createSqliteClient(): PrismaClient {
  const clientPath = path.join(backendDir, "node_modules", ".prisma-sqlite", "client");
  if (!fs.existsSync(clientPath)) {
    throw new Error(
      "DATABASE_URL is not set and the SQLite fallback client is missing. Run `npm run db:setup` in /backend."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient: SqlitePrismaClient } = require(clientPath);
  const base = new SqlitePrismaClient({ log: logLevels });

  const extended = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          let a = stripInsensitiveMode(args ?? {});
          if (operation === "createMany" || operation === "createManyAndReturn") delete a.skipDuplicates;

          const fields = JSON_FIELDS[model];
          if (fields) {
            if ("data" in a) a.data = serializeData(a.data, fields);
            if ("create" in a) a.create = serializeData(a.create, fields);
            if ("update" in a) a.update = serializeData(a.update, fields);
          }

          const result = await query(a);
          if (!fields) return result;
          return Array.isArray(result) ? result.map((r) => deserializeRow(r, fields)) : deserializeRow(result, fields);
        },
      },
    },
  });

  console.log("🗄️  DATABASE_URL not set → using local SQLite fallback (backend/prisma/dev.db)");
  return extended as unknown as PrismaClient;
}

export const prisma: PrismaClient =
  global.__prisma ??
  (isSqliteFallback ? createSqliteClient() : new PrismaClient({ log: logLevels }));

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
