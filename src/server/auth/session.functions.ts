import { createServerFn } from "@tanstack/react-start"
import { getRequest, setResponseStatus } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth/auth"

async function readSession() {
  return auth.api.getSession({ headers: getRequest().headers })
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
