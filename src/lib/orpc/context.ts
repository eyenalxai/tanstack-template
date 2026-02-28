import { ORPCError, os } from "@orpc/server"
import { z } from "zod"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/database/client"

const authSessionSchema = z.object({
  userId: z.string(),
})

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

const authSessionDataSchema = z.object({
  session: authSessionSchema,
  user: authUserSchema,
})

export type AuthSession = z.infer<typeof authSessionSchema>
export type AuthUser = z.infer<typeof authUserSchema>

export const baseProcedure = os.$context<{ db: typeof db; headers: Headers }>()

export const publicProcedure = baseProcedure

export const authorizedProcedure = publicProcedure.use(async ({ context, next }) => {
  const sessionResult = await auth.api.getSession({
    headers: context.headers,
  })

  const parsedSessionResult = authSessionDataSchema.safeParse(sessionResult)

  if (!parsedSessionResult.success) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      ...context,
      session: parsedSessionResult.data.session,
      user: parsedSessionResult.data.user,
    },
  })
})
