import { pgTable, text, serial, integer, boolean, timestamp, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const entriesTable = pgTable(
  "entries",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    stars: integer("stars").notNull(),
    goodInput1: text("good_input_1").notNull(),
    goodInput2: text("good_input_2").notNull(),
    improvementInput: text("improvement_input"),
    skippedImprovement: boolean("skipped_improvement").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("entries_user_date_idx").on(table.userId, table.entryDate)],
);

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DbEntry = typeof entriesTable.$inferSelect;
