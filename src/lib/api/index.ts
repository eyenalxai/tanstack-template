import { createApiSurface } from "@/lib/api/factory"
import { stuffDomain } from "@/lib/api/stuff"

const domains = {
  stuff: stuffDomain,
} as const

const apiSurface = createApiSurface(domains)

export const api = apiSurface.api
export const createApiUtils = apiSurface.createApiUtils
export const useApiUtils = apiSurface.useApiUtils
