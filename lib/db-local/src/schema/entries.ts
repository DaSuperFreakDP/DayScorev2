import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const entriesTable = sqliteTable(
  "entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    entryDate: text("entry_date").notNull(),
    stars: integer("stars").notNull(),
    goodInput1: text("good_input_1").notNull(),
    goodInput2: text("good_input_2").notNull(),
    improvementInput: text("improvement_input"),
    skippedImprovement: integer("skipped_improvement", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("entries_user_date_idx").on(table.userId, table.entryDate)],
);

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DbEntry = typeof entriesTable.$inferSelect;
