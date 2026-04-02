import { relations, sql } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { users } from "@/lib/database/better-auth"

export const stuffs = pgTable("stuffs", {
  uuid: uuid("uuid")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .default(sql`now()`)
    .notNull(),
})

export type StuffSelect = typeof stuffs.$inferSelect
export type StuffInsert = typeof stuffs.$inferInsert

export const stuffsRelations = relations(stuffs, ({ one }) => ({
  user: one(users, {
    fields: [stuffs.userId],
    references: [users.id],
  }),
}))
