import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as authSchema from "@/lib/database/auth-schema"
import * as schema from "@/lib/database/schema"
import { serverEnv } from "@/lib/env/server-env"

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
})

export const createClient = () => {
  return drizzle({
    client: pool,
    schema: { ...schema, ...authSchema },
  })
}

export type Transaction =
  | Parameters<Parameters<ReturnType<typeof createClient>["transaction"]>[0]>[0]
  | ReturnType<typeof createClient>

export const db = createClient()
