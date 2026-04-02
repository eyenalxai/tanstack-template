import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth/better-auth"

const readSession = async () => {
  return auth.api.getSession({ headers: getRequest().headers })
}

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  return await readSession()
})
