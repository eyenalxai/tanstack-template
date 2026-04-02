import { createRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"

import { getQueryClient } from "@/lib/query-client"

import { routeTree } from "./routeTree.gen"

export const getRouter = () => {
  const queryClient = getQueryClient()
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
    },
  })

  return routerWithQueryClient(router, queryClient)
}
