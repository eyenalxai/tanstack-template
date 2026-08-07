import type { OxlintConfig } from "oxlint"

import type { ReactDoctorGroupConfig } from "./groups.ts"
import type { ReactDoctorRuleGroup } from "./registry.ts"

import { reactDoctorGroups } from "./groups.ts"
import { reactDoctorRuleRegistry } from "./registry.ts"

type RuleConfig = NonNullable<OxlintConfig["rules"]>
type RuleSeverity = "error" | "off"

const isReactDoctorRuleGroup = (group: string): group is ReactDoctorRuleGroup =>
  group in reactDoctorGroups

const resolveGroupConfig = (
  config: ReactDoctorGroupConfig,
): {
  severity: RuleSeverity
  rules: RuleConfig
} => {
  if (typeof config === "string") {
    return { severity: config, rules: {} }
  }

  return {
    severity: config.severity,
    rules: config.rules ?? {},
  }
}

const buildReactDoctorRules = (): RuleConfig => {
  const rules: RuleConfig = {}

  for (const [group, ruleKeys] of Object.entries(reactDoctorRuleRegistry)) {
    const groupConfig = isReactDoctorRuleGroup(group) ? reactDoctorGroups[group] : "error"
    const { severity: groupDefault, rules: groupRules } = resolveGroupConfig(groupConfig)

    for (const ruleKey of ruleKeys) {
      if (!ruleKey.startsWith("react-doctor/")) {
        continue
      }

      rules[ruleKey] = groupRules[ruleKey] ?? groupDefault
    }
  }

  return rules
}

export { buildReactDoctorRules }
