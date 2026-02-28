import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders, setResponseStatus } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth/auth"

async function readSession() {
  const headers = getRequestHeaders()
  return auth.api.getSession({ headers })
}

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  return await readSession()
})

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await readSession()

  if (!session) {
    setResponseStatus(401)
    throw new Error("Unauthorized")
  }

  return session
})
