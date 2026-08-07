import type { OxlintConfig } from "oxlint"

import { baseRules } from "./base-rules.ts"
import { frontendRuleOverrides } from "./frontend-rules.ts"

type PluginConfig = NonNullable<OxlintConfig["plugins"]>
type SettingsConfig = NonNullable<OxlintConfig["settings"]>
type OverridesConfig = NonNullable<OxlintConfig["overrides"]>
type JsPluginsConfig = NonNullable<OxlintConfig["jsPlugins"]>

const plugins: PluginConfig = [
  "typescript",
  "unicorn",
  "oxc",
  "promise",
  "import",
  "node",
  "react",
  "react-perf",
]

const jsPlugins: JsPluginsConfig = [
  { name: "react-doctor", specifier: "oxlint-plugin-react-doctor" },
]

const categories: NonNullable<OxlintConfig["categories"]> = {
  correctness: "error",
  suspicious: "error",
  perf: "error",
  pedantic: "error",
  style: "error",
  restriction: "error",
}

const settings: SettingsConfig = {
  react: {
    version: "19.2.8",
  },
  "react-doctor": {
    forbidComponentProps: {
      forbid: ["style"],
    },
    onlyExportComponents: {
      allowExportNames: ["Route"],
    },
  },
}

const ignorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.output/**",
  "**/drizzle/**",
  "**/*.d.ts",
  "**/*.config.{js,ts,mjs,cjs}",
  "**/tsconfig.tsbuildinfo",
  "src/components/ui/**",
]

const schemaFileOverrides: OverridesConfig = [
  {
    files: ["**/schema.ts", "**/schema/**/*.ts"],
    rules: {
      "oxc/no-barrel-file": "off",
    },
  },
]

const routeFileOverrides: OverridesConfig = [
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "import/group-exports": "off",
    },
  },
]

const toolingFileOverrides: OverridesConfig = [
  {
    files: ["oxlint.config.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    files: [
      "scripts/oxlint/generate-registry.ts",
      "scripts/oxlint/react-doctor/registry.ts",
      "scripts/oxlint/lib/**",
    ],
    rules: {
      "max-lines": "off",
      "no-underscore-dangle": "off",
      "node/no-process-env": "off",
      "node/no-sync": "off",
      "require-unicode-regexp": "off",
      "prefer-named-capture-group": "off",
      "init-declarations": "off",
    },
  },
]

const createOxlintConfig = (): OxlintConfig => {
  return {
    plugins,
    jsPlugins,
    categories,
    rules: {
      ...baseRules,
      ...frontendRuleOverrides,
    },
    env: {
      builtin: true,
    },
    ignorePatterns,
    settings,
    overrides: [...schemaFileOverrides, ...routeFileOverrides, ...toolingFileOverrides],
  }
}

export { createOxlintConfig }
