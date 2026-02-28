import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as authSchema from "@/lib/database/auth-schema"
import * as schema from "@/lib/database/schema"
import { serverEnv } from "@/lib/env/server-env"

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
})

export const db = drizzle({
  client: pool,
  schema: { ...schema, ...authSchema },
})
