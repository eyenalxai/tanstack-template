import {
  createProcedureDomain,
  createQueryProcedure,
  createServerDataMutationProcedure,
} from "@/lib/api/factory"
import { createStuff, listStuffs, updateStuff } from "@/server/stuff/stuff.functions"

const stuffKeys = {
  all: () => ["stuff"] as const,
  list: () => ["stuff", "list"] as const,
  create: () => ["stuff", "create"] as const,
  update: () => ["stuff", "update"] as const,
}

const stuffDomain = createProcedureDomain({
  list: createQueryProcedure({
    key: stuffKeys.list,
    queryFn: listStuffs,
    invalidateKey: stuffKeys.all(),
  }),
  create: createServerDataMutationProcedure({
    serverFn: createStuff,
    mutationKey: stuffKeys.create(),
  }),
  update: createServerDataMutationProcedure({
    serverFn: updateStuff,
    mutationKey: stuffKeys.update(),
  }),
})

export const stuffApi = stuffDomain.api
export const createStuffUtils = stuffDomain.createUtils
