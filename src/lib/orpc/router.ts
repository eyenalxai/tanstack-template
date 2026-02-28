import { ORPCError } from "@orpc/server"

import { authorizedProcedure, publicProcedure } from "@/lib/orpc/context"
import { createStuff, listStuffs, updateStuff } from "@/server/stuff/stuff.functions"
import {
  createStuffSchema,
  listStuffsOutputSchema,
  stuffSchema,
  updateStuffSchema,
} from "@/server/stuff/stuff.schemas"

const listStuffProcedure = publicProcedure
  .output(listStuffsOutputSchema)
  .handler(async ({ context }) => {
    return await listStuffs(context.db)
  })

const createStuffProcedure = authorizedProcedure
  .input(createStuffSchema)
  .output(stuffSchema)
  .handler(async ({ input, context }) => {
    return await createStuff(context.db, input, context.user.id)
  })

const updateStuffProcedure = authorizedProcedure
  .input(updateStuffSchema)
  .output(stuffSchema)
  .handler(async ({ input, context }) => {
    const updatedStuff = await updateStuff(context.db, input, context.user.id)

    if (updatedStuff === null) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can only edit your own stuff.",
      })
    }

    return updatedStuff
  })

export const router = {
  stuff: {
    list: listStuffProcedure,
    create: createStuffProcedure,
    update: updateStuffProcedure,
  },
}

export type AppRouter = typeof router
