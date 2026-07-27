import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import * as schema from "./schema";
import { migrate } from "./migrate";

function getDataDir(): string {
  const envDir = process.env.DAYSCORE_DATA_DIR;
  if (envDir) return envDir;
  return "./DayScoreData";
}

const dataDir = getDataDir();
await mkdir(dataDir, { recursive: true });

const dbPath = `${dataDir}/dayscore.db`;
const sqlite = new Database(dbPath);

// Ensure WAL mode for better concurrency and performance.
sqlite.exec("PRAGMA journal_mode = WAL;");

migrate(sqlite);

export const db = drizzle(sqlite, { schema });
export * from "./schema";
