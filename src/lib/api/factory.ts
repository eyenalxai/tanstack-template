import type {
  DefaultError,
  MutationKey,
  QueryClient,
  QueryKey,
  Updater,
  UseMutationOptions,
} from "@tanstack/react-query"

import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

type ProcedureArgs<TInput> = [TInput] extends [undefined] ? [] : [input: TInput]
type InvalidateKey<TInput> = QueryKey | ((input: TInput) => QueryKey)
type InvalidateScope = "self" | "domain"

function getInput<TInput>(args: ProcedureArgs<TInput>) {
  return args[0] as TInput
}

function resolveInvalidateKey<TInput>(
  input: TInput,
  queryKey: QueryKey,
  invalidateKey: InvalidateKey<TInput> | undefined,
  invalidateScope: InvalidateScope | undefined,
  domainKey: QueryKey | undefined,
) {
  if (invalidateKey === undefined) {
    if (invalidateScope === "domain" && domainKey !== undefined) {
      return domainKey
    }

    return queryKey
  }

  if (typeof invalidateKey === "function") {
    return invalidateKey(input)
  }

  return invalidateKey
}

interface QueryProcedureConfigWithInput<TInput, TOutput, TQueryKey extends QueryKey> {
  key?: (input: TInput) => TQueryKey
  queryFn: (input: TInput) => Promise<TOutput>
  invalidateKey?: InvalidateKey<TInput>
  invalidateScope?: InvalidateScope
}

interface QueryProcedureConfigWithoutInput<TOutput, TQueryKey extends QueryKey> {
  key?: () => TQueryKey
  queryFn: () => Promise<TOutput>
  invalidateKey?: QueryKey
  invalidateScope?: InvalidateScope
}

interface QueryProcedureInternalConfig<
  TInput,
  TOutput,
  TQueryKey extends QueryKey,
> extends QueryProcedureConfigWithInput<TInput, TOutput, TQueryKey> {
  domainKey?: QueryKey
}

export interface QueryProcedure<TInput, TOutput, TQueryKey extends QueryKey> {
  kind: "query"
  key: (...args: ProcedureArgs<TInput>) => TQueryKey
  invalidateKey: (...args: ProcedureArgs<TInput>) => QueryKey
  queryOptions: (
    ...args: ProcedureArgs<TInput>
  ) => ReturnType<typeof queryOptions<TOutput, DefaultError, TOutput, TQueryKey>>
  useQuery: (
    ...args: ProcedureArgs<TInput>
  ) => ReturnType<typeof useQuery<TOutput, DefaultError, TOutput, TQueryKey>>
  useSuspenseQuery: (
    ...args: ProcedureArgs<TInput>
  ) => ReturnType<typeof useSuspenseQuery<TOutput, DefaultError, TOutput, TQueryKey>>
  __internalConfig?: QueryProcedureInternalConfig<TInput, TOutput, TQueryKey>
}

export function createQueryProcedure<TOutput, TQueryKey extends QueryKey>(
  config: QueryProcedureConfigWithoutInput<TOutput, TQueryKey>,
): QueryProcedure<undefined, TOutput, TQueryKey>
export function createQueryProcedure<TInput, TOutput, TQueryKey extends QueryKey>(
  config: QueryProcedureConfigWithInput<TInput, TOutput, TQueryKey>,
): QueryProcedure<TInput, TOutput, TQueryKey>
export function createQueryProcedure<TInput, TOutput, TQueryKey extends QueryKey>(
  config: QueryProcedureConfigWithInput<TInput, TOutput, TQueryKey>,
) {
  const internalConfig = config as QueryProcedureInternalConfig<TInput, TOutput, TQueryKey>

  function getQueryKey(input: TInput): TQueryKey {
    if (internalConfig.key === undefined) {
      throw new Error(
        "Missing query key. Provide `key` in createQueryProcedure or compose via createProcedureDomain(domainName, procedures).",
      )
    }

    return internalConfig.key(input)
  }

  function getOptions(...args: ProcedureArgs<TInput>) {
    const input = getInput(args)
    const queryKey = getQueryKey(input)

    return queryOptions({
      queryKey,
      queryFn: () => internalConfig.queryFn(input),
    })
  }

  return {
    kind: "query",
    key: (...args: ProcedureArgs<TInput>) => getQueryKey(getInput(args)),
    invalidateKey: (...args: ProcedureArgs<TInput>) => {
      const input = getInput(args)
      const queryKey = getQueryKey(input)
      return resolveInvalidateKey(
        input,
        queryKey,
        internalConfig.invalidateKey,
        internalConfig.invalidateScope,
        internalConfig.domainKey,
      )
    },
    queryOptions: getOptions,
    useQuery: (...args: ProcedureArgs<TInput>) => useQuery(getOptions(...args)),
    useSuspenseQuery: (...args: ProcedureArgs<TInput>) => useSuspenseQuery(getOptions(...args)),
    __internalConfig: internalConfig,
  } as QueryProcedure<TInput, TOutput, TQueryKey>
}

interface MutationProcedureConfig<TInput, TOutput, TMutationKey extends MutationKey | undefined> {
  mutationFn: (input: TInput) => Promise<TOutput>
  mutationKey?: TMutationKey
}

export interface MutationProcedure<
  TInput,
  TOutput,
  TMutationKey extends MutationKey | undefined = undefined,
> {
  kind: "mutation"
  mutationKey?: TMutationKey
  mutationOptions: <TError = DefaultError, TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TOutput, TError, TInput, TContext>,
      "mutationFn" | "mutationKey"
    >,
  ) => ReturnType<typeof mutationOptions<TOutput, TError, TInput, TContext>>
  useMutation: <TError = DefaultError, TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TOutput, TError, TInput, TContext>,
      "mutationFn" | "mutationKey"
    >,
  ) => ReturnType<typeof useMutation<TOutput, TError, TInput, TContext>>
  __internalConfig?: MutationProcedureConfig<TInput, TOutput, TMutationKey>
}

export function createMutationProcedure<
  TInput,
  TOutput,
  TMutationKey extends MutationKey | undefined = undefined,
>(config: MutationProcedureConfig<TInput, TOutput, TMutationKey>) {
  const internalConfig = config

  function getOptions<TError = DefaultError, TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TOutput, TError, TInput, TContext>,
      "mutationFn" | "mutationKey"
    >,
  ) {
    if (internalConfig.mutationKey === undefined) {
      return mutationOptions({
        mutationFn: internalConfig.mutationFn,
        ...options,
      })
    }

    return mutationOptions({
      mutationFn: internalConfig.mutationFn,
      mutationKey: internalConfig.mutationKey,
      ...options,
    })
  }

  return {
    kind: "mutation",
    mutationKey: internalConfig.mutationKey,
    mutationOptions: getOptions,
    useMutation: <TError = DefaultError, TContext = unknown>(
      options?: Omit<
        UseMutationOptions<TOutput, TError, TInput, TContext>,
        "mutationFn" | "mutationKey"
      >,
    ) => useMutation(getOptions(options)),
    __internalConfig: internalConfig,
  } as MutationProcedure<TInput, TOutput, TMutationKey>
}

type ServerDataFn<TInput, TOutput> = (options: { data: TInput }) => Promise<TOutput>

export function createServerDataMutationProcedure<
  TServerFn extends ServerDataFn<any, any>,
  TMutationKey extends MutationKey | undefined = undefined,
>(config: { serverFn: TServerFn; mutationKey?: TMutationKey }) {
  type TInput = Parameters<TServerFn>[0]["data"]
  type TOutput = Awaited<ReturnType<TServerFn>>

  return createMutationProcedure<TInput, TOutput, TMutationKey>({
    mutationFn: (input) => config.serverFn({ data: input } as Parameters<TServerFn>[0]),
    mutationKey: config.mutationKey,
  })
}

export interface QueryProcedureUtils<TInput, TOutput, TQueryKey extends QueryKey> {
  key: (...args: ProcedureArgs<TInput>) => TQueryKey
  queryOptions: (
    ...args: ProcedureArgs<TInput>
  ) => ReturnType<typeof queryOptions<TOutput, DefaultError, TOutput, TQueryKey>>
  prefetch: (...args: ProcedureArgs<TInput>) => Promise<void>
  ensureData: (...args: ProcedureArgs<TInput>) => Promise<TOutput>
  invalidate: (...args: ProcedureArgs<TInput>) => Promise<void>
  getData: (...args: ProcedureArgs<TInput>) => TOutput | undefined
  setData: (
    updater: Updater<TOutput | undefined, TOutput | undefined>,
    ...args: ProcedureArgs<TInput>
  ) => TOutput | undefined
}

export function createQueryUtils<TInput, TOutput, TQueryKey extends QueryKey>(
  procedure: QueryProcedure<TInput, TOutput, TQueryKey>,
  queryClient: QueryClient,
): QueryProcedureUtils<TInput, TOutput, TQueryKey> {
  return {
    key: procedure.key,
    queryOptions: procedure.queryOptions,
    prefetch: (...args: ProcedureArgs<TInput>) =>
      queryClient.prefetchQuery(procedure.queryOptions(...args)),
    ensureData: (...args: ProcedureArgs<TInput>) =>
      queryClient.ensureQueryData(procedure.queryOptions(...args)),
    invalidate: (...args: ProcedureArgs<TInput>) =>
      queryClient.invalidateQueries({ queryKey: procedure.invalidateKey(...args) }),
    getData: (...args: ProcedureArgs<TInput>) =>
      queryClient.getQueryData<TOutput>(procedure.key(...args)),
    setData: (
      updater: Updater<TOutput | undefined, TOutput | undefined>,
      ...args: ProcedureArgs<TInput>
    ) => queryClient.setQueryData<TOutput>(procedure.key(...args), updater),
  }
}

interface AnyQueryProcedure {
  kind: "query"
  key: (...args: any[]) => any
  invalidateKey: (...args: any[]) => any
  queryOptions: (...args: any[]) => any
  __internalConfig?: QueryProcedureInternalConfig<any, any, QueryKey>
}

interface AnyMutationProcedure {
  kind: "mutation"
  mutationKey?: MutationKey
  __internalConfig?: MutationProcedureConfig<any, any, MutationKey | undefined>
}

type AnyProcedure = AnyQueryProcedure | AnyMutationProcedure
type AnyProcedureDomain = {
  api: Record<string, AnyProcedure>
  createUtils: (queryClient: QueryClient) => Record<string, unknown>
}

type DomainUtils<TProcedures extends Record<string, AnyProcedure>> = {
  [K in keyof TProcedures as TProcedures[K] extends { kind: "query" }
    ? K
    : never]: TProcedures[K] extends QueryProcedure<infer TInput, infer TOutput, infer TQueryKey>
    ? QueryProcedureUtils<TInput, TOutput, TQueryKey>
    : never
}

function buildDerivedQueryKey(domainName: string, procedureName: string, input: unknown): QueryKey {
  if (input === undefined) {
    return [domainName, procedureName]
  }

  return [domainName, procedureName, input]
}

function buildDerivedMutationKey(domainName: string, procedureName: string): MutationKey {
  return [domainName, procedureName]
}

function buildDomainKey(domainName: string): QueryKey {
  return [domainName]
}

export function createProcedureDomain<const TProcedures extends Record<string, AnyProcedure>>(
  domainName: string,
  procedures: TProcedures,
) {
  for (const [procedureName, procedure] of Object.entries(procedures)) {
    if (procedure.kind === "query") {
      const internalConfig = procedure.__internalConfig
      if (internalConfig !== undefined) {
        if (internalConfig.key === undefined) {
          internalConfig.key = ((input: unknown) =>
            buildDerivedQueryKey(domainName, procedureName, input)) as (input: any) => QueryKey
        }

        internalConfig.domainKey = buildDomainKey(domainName)
      }
      continue
    }

    const internalConfig = procedure.__internalConfig
    if (internalConfig !== undefined && internalConfig.mutationKey === undefined) {
      internalConfig.mutationKey = buildDerivedMutationKey(domainName, procedureName)
      procedure.mutationKey = internalConfig.mutationKey
    }
  }

  function createUtils(queryClient: QueryClient): DomainUtils<TProcedures> {
    const utilsEntries = Object.entries(procedures).flatMap(([procedureName, procedure]) => {
      if (procedure.kind !== "query") {
        return []
      }

      return [
        [
          procedureName,
          createQueryUtils(procedure as QueryProcedure<any, any, QueryKey>, queryClient),
        ],
      ]
    })

    return Object.fromEntries(utilsEntries) as DomainUtils<TProcedures>
  }

  return {
    api: procedures,
    createUtils,
  } as const
}

type DomainApi<TDomains extends Record<string, AnyProcedureDomain>> = {
  [K in keyof TDomains]: TDomains[K]["api"]
}

type DomainUtilsMap<TDomains extends Record<string, AnyProcedureDomain>> = {
  [K in keyof TDomains]: ReturnType<TDomains[K]["createUtils"]>
}

export function createApiSurface<const TDomains extends Record<string, AnyProcedureDomain>>(
  domains: TDomains,
) {
  const domainApi = Object.fromEntries(
    Object.entries(domains).map(([domainName, domain]) => [domainName, domain.api]),
  ) as DomainApi<TDomains>

  function createApiUtils(queryClient: QueryClient): DomainUtilsMap<TDomains> {
    return Object.fromEntries(
      Object.entries(domains).map(([domainName, domain]) => [
        domainName,
        domain.createUtils(queryClient),
      ]),
    ) as DomainUtilsMap<TDomains>
  }

  function useApiUtils() {
    const queryClient = useQueryClient()
    return createApiUtils(queryClient)
  }

  return {
    api: {
      ...domainApi,
      useUtils: useApiUtils,
    } as DomainApi<TDomains> & { useUtils: typeof useApiUtils },
    createApiUtils,
    useApiUtils,
  } as const
}
