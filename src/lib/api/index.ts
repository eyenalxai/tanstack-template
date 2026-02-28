import type { QueryClient } from "@tanstack/react-query"

import { useQueryClient } from "@tanstack/react-query"

import { stuffApi, createStuffUtils } from "@/lib/api/stuff"

export function createApiUtils(queryClient: QueryClient) {
  return {
    stuff: createStuffUtils(queryClient),
  } as const
}

export function useApiUtils() {
  const queryClient = useQueryClient()
  return createApiUtils(queryClient)
}

export const api = {
  stuff: stuffApi,
  useUtils: useApiUtils,
} as const
