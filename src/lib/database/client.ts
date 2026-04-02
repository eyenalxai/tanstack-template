import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as betterAuthSchema from "@/lib/database/better-auth"
import * as stuffsSchema from "@/lib/database/stuffs"
import { serverEnv } from "@/lib/env/server-env"

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
})

export const createClient = () => {
  return drizzle({
    client: pool,
    schema: { ...stuffsSchema, ...betterAuthSchema },
  })
}

export type Transaction =
  | Parameters<Parameters<ReturnType<typeof createClient>["transaction"]>[0]>[0]
  | ReturnType<typeof createClient>

export const db = createClient()
