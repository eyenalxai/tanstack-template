import type { PluginRuleEntry, ReactDoctorPlugin } from "./react-doctor-plugin.ts"

import { getImplementablePluginRules, isOxlintReactDoctorRuleKey } from "./react-doctor-plugin.ts"

const stateAndEffectsPattern =
  /effect|hook|state|memo|transition|activity|derived|fetch-in-effect|cascading|layout-effect|sync-external|use-effect|use-memo|set-state|pass-live|pass-data|initialize-state|adjust-state|reset-all|chain-state|event-handler|derived-state|render-in-render|render-prop|no-set-state|state-in-constructor|advanced-event|async-defer|client-passive|effect-needs|hooks-no|jotai/u

const bundleSizeRuleIds = new Set([
  "no-barrel-import",
  "no-dynamic-import-path",
  "no-full-lodash-import",
  "no-moment",
  "no-undeferred-third-party",
  "no-unoptimized-package-import",
  "no-useless-reexport",
])

const heuristics: [string, (rule: PluginRuleEntry) => boolean][] = [
  ["Next.js", (rule) => rule.id.startsWith("nextjs-")],
  ["React Native", (rule) => rule.id.startsWith("rn-") || rule.id.startsWith("expo-")],
  ["Preact", (rule) => rule.id.startsWith("preact-")],
  ["TanStack Query", (rule) => rule.id.startsWith("query-")],
  ["TanStack Start", (rule) => rule.id.startsWith("tanstack-start-")],
  ["Server", (rule) => rule.id.startsWith("server-")],
  ["Bundle Size", (rule) => bundleSizeRuleIds.has(rule.id)],
  [
    "State & Effects",
    (rule) => rule.rule?.category === "Bugs" && stateAndEffectsPattern.test(rule.id),
  ],
  ["Correctness", (rule) => rule.rule?.category === "Bugs"],
  ["Architecture", (rule) => rule.rule?.category === "Maintainability"],
  ["Performance", (rule) => rule.rule?.category === "Performance"],
  ["Security", (rule) => rule.rule?.category === "Security"],
  ["Accessibility", (rule) => rule.rule?.category === "Accessibility"],
]

const categoryOrder = [
  "Accessibility",
  "Architecture",
  "Bundle Size",
  "Correctness",
  "Dead Code",
  "Next.js",
  "Performance",
  "Preact",
  "React Native",
  "Security",
  "Server",
  "State & Effects",
  "TanStack Query",
  "TanStack Start",
  "Other",
] as const

const categoryOrderSet = new Set<string>(categoryOrder)

const assignUnplacedRules = (
  groups: Record<string, string[]>,
  assigned: Set<string>,
  pluginRules: PluginRuleEntry[],
): void => {
  for (const rule of pluginRules) {
    if (assigned.has(rule.key)) {
      continue
    }

    let placed = false

    for (const [group, test] of heuristics) {
      if (test(rule)) {
        groups[group] ??= []
        groups[group].push(rule.key)
        assigned.add(rule.key)
        placed = true
        break
      }
    }

    if (!placed) {
      const category = rule.rule?.category ?? "Other"
      groups[category] ??= []
      groups[category].push(rule.key)
      assigned.add(rule.key)
    }
  }
}

const buildRuleGroups = (
  htmlGroups: Record<string, string[]>,
  plugin: ReactDoctorPlugin,
): Record<string, string[]> => {
  const groups = structuredClone(htmlGroups)
  const assigned = new Set(Object.values(groups).flat())

  assignUnplacedRules(groups, assigned, getImplementablePluginRules(plugin))

  const sanitizedGroups: Record<string, string[]> = {}

  for (const [category, categoryRules] of Object.entries(groups)) {
    const filteredRules = [...new Set(categoryRules)]
      .filter((ruleKey) => isOxlintReactDoctorRuleKey(ruleKey))
      .toSorted()

    if (filteredRules.length > 0) {
      sanitizedGroups[category] = filteredRules
    }
  }

  return sanitizedGroups
}

const hasCategoryRules = (groups: Record<string, string[]>, category: string): boolean =>
  (groups[category]?.length ?? 0) > 0

const sortCategories = (groups: Record<string, string[]>): string[] => [
  ...categoryOrder.filter((category) => hasCategoryRules(groups, category)),
  ...Object.keys(groups)
    .filter((category) => !categoryOrderSet.has(category))
    .toSorted(),
]

export { buildRuleGroups, sortCategories }
