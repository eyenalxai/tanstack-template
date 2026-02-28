import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import * as authSchema from "@/lib/database/auth-schema"
import { db } from "@/lib/database/client"
import * as schema from "@/lib/database/schema"
import { serverEnv } from "@/lib/env/server-env"

export const auth = betterAuth({
  appName: "my-app",
  session: {
    freshAge: 7 * 24 * 60 * 60, // 7 days
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  plugins: [tanstackStartCookies()],
})
