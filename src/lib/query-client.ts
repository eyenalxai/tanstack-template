import type { StandardRPCJsonSerializedMetaItem } from "@orpc/client/standard"

import { StandardRPCJsonSerializer } from "@orpc/client/standard"
import { QueryClient } from "@tanstack/react-query"

type SerializedQueryData = {
  json: unknown
  meta: readonly StandardRPCJsonSerializedMetaItem[]
}

const serializer = new StandardRPCJsonSerializer()

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function isSerializedMetaItem(value: unknown): value is StandardRPCJsonSerializedMetaItem {
  if (!isUnknownArray(value) || value.length === 0) {
    return false
  }

  const firstItem = value[0]
  if (typeof firstItem !== "number") {
    return false
  }

  return value
    .slice(1)
    .every((segment) => typeof segment === "string" || typeof segment === "number")
}

function isSerializedQueryData(value: unknown): value is SerializedQueryData {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("json" in value) || !("meta" in value)) {
    return false
  }

  const meta = value.meta
  return Array.isArray(meta) && meta.every(isSerializedMetaItem)
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        },
      },
      dehydrate: {
        serializeData(data) {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData(data) {
          const rawData: unknown = data

          if (!isSerializedQueryData(rawData)) {
            return rawData
          }

          return serializer.deserialize(rawData.json, rawData.meta)
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  }

  browserQueryClient ??= makeQueryClient()

  return browserQueryClient
}
