import { and, eq } from "drizzle-orm"

import type { Transaction } from "@/lib/database/client"
import type { CreateStuffInput, UpdateStuffInput } from "@/server/stuff/stuff.schemas"

import { stuffs } from "@/lib/database/schema"

export const listStuffs = (tx: Transaction) => {
  return tx.query.stuffs.findMany({
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

export const createStuff = async (tx: Transaction, input: CreateStuffInput, userId: string) => {
  const [newStuff] = await tx
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

export const updateStuff = async (tx: Transaction, input: UpdateStuffInput, userId: string) => {
  const [updatedStuff] = await tx
    .update(stuffs)
    .set({
      description: input.description,
    })
    .where(and(eq(stuffs.uuid, input.uuid), eq(stuffs.userId, userId)))
    .returning()

  return updatedStuff ?? null
}
