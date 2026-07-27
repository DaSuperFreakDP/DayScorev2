import type { Database } from "bun:sqlite";

export function migrate(sqlite: Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL,
      stars INTEGER NOT NULL,
      good_input_1 TEXT NOT NULL,
      good_input_2 TEXT NOT NULL,
      improvement_input TEXT,
      skipped_improvement INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE UNIQUE INDEX IF NOT EXISTS entries_user_date_idx ON entries(user_id, entry_date);
  `);
}
