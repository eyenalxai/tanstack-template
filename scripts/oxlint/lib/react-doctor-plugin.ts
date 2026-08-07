interface PluginRuleMeta {
  id: string
  category?: string
}

interface PluginRuleEntry {
  key: string
  id: string
  rule?: PluginRuleMeta
}

interface ExternalRuleEntry {
  key: string
}

interface ReactDoctorPlugin {
  RULES: (PluginRuleEntry | ExternalRuleEntry)[]
  EXTERNAL_RULES?: ExternalRuleEntry[]
  default: {
    rules: Record<string, unknown>
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isPluginRuleEntry = (value: unknown): value is PluginRuleEntry =>
  isRecord(value) && typeof value.key === "string" && typeof value.id === "string"

const isReactDoctorPlugin = (value: unknown): value is ReactDoctorPlugin => {
  if (!isRecord(value) || !("RULES" in value) || !Array.isArray(value.RULES)) {
    return false
  }

  if (!value.RULES.every((rule) => isRecord(rule) && typeof rule.key === "string")) {
    return false
  }

  if (!("default" in value) || !isRecord(value.default) || !("rules" in value.default)) {
    return false
  }

  return isRecord(value.default.rules)
}

const getImplementablePluginRules = (plugin: ReactDoctorPlugin): PluginRuleEntry[] =>
  plugin.RULES.filter(isPluginRuleEntry)

const isPackageJson = (value: unknown): value is { version: string } =>
  isRecord(value) && typeof value.version === "string"

const isOxlintReactDoctorRuleKey = (ruleKey: string): boolean => ruleKey.startsWith("react-doctor/")

export type { ExternalRuleEntry, PluginRuleEntry, ReactDoctorPlugin }
export {
  getImplementablePluginRules,
  isOxlintReactDoctorRuleKey,
  isPackageJson,
  isReactDoctorPlugin,
}
