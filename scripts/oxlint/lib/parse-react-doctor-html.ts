import type { ReactDoctorPlugin } from "./react-doctor-plugin.ts"

import { getImplementablePluginRules, isOxlintReactDoctorRuleKey } from "./react-doctor-plugin.ts"

const mainContentRegex = /<main[^>]*>(?<content>[\s\S]*?)<\/main>/u
const sectionRegex = /<h2[^>]*>(?<category>[^<]+)<\/h2>(?<section>[\s\S]*?)(?=<h2|$)/gu
const ruleCodeRegex = /<code>(?<rule>[^<]+)<\/code>/gu

const parseHtmlCategories = (html: string): Map<string, string[]> => {
  const mainMatch = mainContentRegex.exec(html)
  const mainContent = mainMatch?.groups?.content ?? html
  const categories = new Map<string, string[]>()

  for (const sectionMatch of mainContent.matchAll(sectionRegex)) {
    const category = sectionMatch.groups?.category?.trim().replaceAll("&amp;", "&")
    const sectionHtml = sectionMatch.groups?.section

    if (category === undefined || sectionHtml === undefined) {
      continue
    }

    const rules = [...sectionHtml.matchAll(ruleCodeRegex)]
      .map((entry) => entry.groups?.rule)
      .filter((rule): rule is string => rule !== undefined)

    if (rules.length > 0) {
      categories.set(category, rules)
    }
  }

  return categories
}

const createHtmlToKey =
  (plugin: ReactDoctorPlugin) =>
  (htmlRule: string): string | null => {
    const pluginRules = getImplementablePluginRules(plugin)
    const pluginById = new Map(pluginRules.map((rule) => [rule.id, rule]))
    const pluginKeys = new Set(pluginRules.map((rule) => rule.key))

    const name = htmlRule.split("/").pop()
    if (name === undefined) {
      return null
    }

    const reactDoctorKey = `react-doctor/${name}`

    if (htmlRule.startsWith("react-doctor/") && pluginKeys.has(htmlRule)) {
      return htmlRule
    }

    if (pluginKeys.has(reactDoctorKey)) {
      return reactDoctorKey
    }

    if (pluginById.has(name)) {
      return pluginById.get(name)?.key ?? null
    }

    if (htmlRule.startsWith("effect/") && pluginKeys.has(reactDoctorKey)) {
      return reactDoctorKey
    }

    return null
  }

const parseHtmlRuleGroups = (html: string, plugin: ReactDoctorPlugin): Record<string, string[]> => {
  const htmlToKey = createHtmlToKey(plugin)
  const groups: Record<string, string[]> = {}

  for (const [category, htmlRules] of parseHtmlCategories(html)) {
    const keys = [
      ...new Set(
        htmlRules
          .map((htmlRule) => htmlToKey(htmlRule))
          .filter((key): key is string => key !== null && isOxlintReactDoctorRuleKey(key)),
      ),
    ].toSorted()

    if (keys.length > 0) {
      groups[category] = keys
    }
  }

  return groups
}

export { parseHtmlRuleGroups }
