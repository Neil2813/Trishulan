import dotenv from "dotenv";
import path from "path";

/**
 * Loads environment variables from backend/.env first, then the project-root .env.
 * dotenv never overrides already-set values, so backend/.env (and real env vars) win.
 * Must be imported before anything reads process.env (e.g. lib/db.ts).
 */
const backendRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, "..", ".env") });

export const backendDir = backendRoot;
