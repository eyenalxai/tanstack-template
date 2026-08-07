import type { OxlintConfig } from "oxlint"

import type { ReactDoctorRuleGroup } from "./registry.ts"

type RuleConfig = NonNullable<OxlintConfig["rules"]>
type RuleSeverity = "error" | "off"

type ReactDoctorGroupConfig =
  | RuleSeverity
  | {
      severity: RuleSeverity
      rules?: RuleConfig
    }

const reactDoctorGroups = {
  Accessibility: {
    severity: "error",
    rules: {
      "react-doctor/control-has-associated-label": "off",
      "react-doctor/no-static-element-interactions": "off",
      "react-doctor/no-tiny-text": "off",
    },
  },
  Architecture: {
    severity: "error",
    rules: {
      "react-doctor/design-no-em-dash-in-jsx-text": "off",
      "react-doctor/hook-use-state": "off",
      "react-doctor/jsx-props-no-spreading": "off",
      "react-doctor/no-generic-handler-names": "off",
      "react-doctor/no-many-boolean-props": "off",
    },
  },
  "Bundle Size": {
    severity: "error",
  },
  Correctness: {
    severity: "error",
    rules: {
      "react-doctor/no-prevent-default": "off",
      "react-doctor/react-in-jsx-scope": "off",
    },
  },
  "Next.js": "off",
  Performance: {
    severity: "error",
    rules: {
      "react-doctor/rendering-svg-precision": "off",
    },
  },
  Preact: {
    severity: "off",
  },
  "React Native": "off",
  Security: "error",
  Server: {
    severity: "error",
  },
  "State & Effects": {
    severity: "error",
    rules: {
      "react-doctor/no-event-handler": "off",
    },
  },
  "TanStack Query": "error",
  "TanStack Start": "error",
} as const satisfies Record<ReactDoctorRuleGroup, ReactDoctorGroupConfig>

export { reactDoctorGroups }
export type { ReactDoctorGroupConfig, RuleSeverity }
