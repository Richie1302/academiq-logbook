import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const entriesTable = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  rawActivity: text("raw_activity").notNull(),
  rewrittenEntry: text("rewritten_entry"),
  week: integer("week"),
  dayOfWeek: text("day_of_week"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entriesTable.$inferSelect;
