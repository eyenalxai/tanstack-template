import { and, eq } from "drizzle-orm"

import type { CreateStuffInput, UpdateStuffInput } from "@/server/stuff/stuff.schemas"

import { db } from "@/lib/database/client"
import { stuffs } from "@/lib/database/schema"

export function listStuffs() {
  return db.query.stuffs.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function createStuff(input: CreateStuffInput, userId: string) {
  const [newStuff] = await db
    .insert(stuffs)
    .values({
      description: input.description,
      userId,
    })
    .returning()

  if (!newStuff) {
    throw new Error("Could not create stuff.")
  }

  return newStuff
}

export async function updateStuff(input: UpdateStuffInput, userId: string) {
  const [updatedStuff] = await db
    .update(stuffs)
    .set({
      description: input.description,
    })
    .where(and(eq(stuffs.uuid, input.uuid), eq(stuffs.userId, userId)))
    .returning()

  return updatedStuff ?? null
}
