import {
  createProcedureDomain,
  createQueryProcedure,
  createServerDataMutationProcedure,
} from "@/lib/api/factory"
import { createStuff, listStuffs, updateStuff } from "@/server/stuff/stuff.functions"

export const stuffDomain = createProcedureDomain("stuff", {
  list: createQueryProcedure({
    queryFn: listStuffs,
    invalidateScope: "domain",
  }),
  create: createServerDataMutationProcedure({
    serverFn: createStuff,
  }),
  update: createServerDataMutationProcedure({
    serverFn: updateStuff,
  }),
})

export const stuffApi = stuffDomain.api
export const createStuffUtils = stuffDomain.createUtils
