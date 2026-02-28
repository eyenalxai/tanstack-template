import type { RouterClient } from "@orpc/server"

import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createRouterClient } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import type { AppRouter } from "@/lib/orpc/router"

import { router } from "@/lib/orpc/router"

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        headers: getRequest().headers,
      }),
    }),
  )
  .client((): RouterClient<AppRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    })

    return createORPCClient<RouterClient<AppRouter>>(link)
  })

export const client = getORPCClient()

export const orpc = createTanstackQueryUtils(client, {
  path: ["orpc"],
})
