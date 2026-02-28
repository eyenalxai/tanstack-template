import { createServerFn } from "@tanstack/react-start"
import { setResponseStatus } from "@tanstack/react-start/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/database/client"
import { stuffs } from "@/lib/database/schema"
import { ensureSession } from "@/server/auth/session.functions"
import { createStuffSchema, updateStuffSchema } from "@/server/stuff/stuff.schemas"

export const listStuffs = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.stuffs.findMany({
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
})

export const createStuff = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createStuffSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [newStuff] = await db
      .insert(stuffs)
      .values({
        description: data.description,
        userId: session.user.id,
      })
      .returning()

    return newStuff
  })

export const updateStuff = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateStuffSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    const [updatedStuff] = await db
      .update(stuffs)
      .set({
        description: data.description,
      })
      .where(and(eq(stuffs.uuid, data.uuid), eq(stuffs.userId, session.user.id)))
      .returning()

    if (!updatedStuff) {
      setResponseStatus(403)
      throw new Error("You can only edit your own stuff.")
    }

    return updatedStuff
  })
