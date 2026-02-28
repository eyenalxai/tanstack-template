import { ORPCError, os } from "@orpc/server"
import { z } from "zod"

import { auth } from "@/lib/auth/auth"

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

export const baseProcedure = os.$context<{ headers: Headers }>()

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
      session: parsedSessionResult.data.session,
      user: parsedSessionResult.data.user,
    },
  })
})
