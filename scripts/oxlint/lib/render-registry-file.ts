const renderRegistryFile = ({
  htmlPath,
  pluginVersion,
  groups,
  sortedCategories,
}: {
  htmlPath: string
  pluginVersion: string
  groups: Record<string, string[]>
  sortedCategories: string[]
}): string => {
  const lines = [
    "// oxlint-disable max-lines",
    "// GENERATED FILE — do not edit by hand.",
    "// Run: bun run gen:react-doctor-registry",
    `// Source HTML: ${htmlPath}`,
    `// Plugin: oxlint-plugin-react-doctor@${pluginVersion}`,
    "",
    "export type ReactDoctorRuleGroup = keyof typeof reactDoctorRuleRegistry",
    "",
    "/** Maps React Doctor rule categories to oxlint rule keys. */",
    "export const reactDoctorRuleRegistry = {",
  ]

  for (const category of sortedCategories) {
    const categoryRules = groups[category]
    if (categoryRules === undefined) {
      continue
    }

    lines.push(`  ${JSON.stringify(category)}: [`)
    for (const key of categoryRules) {
      lines.push(`    ${JSON.stringify(key)},`)
    }
    lines.push("  ],")
  }

  lines.push("} as const satisfies Record<string, readonly string[]>", "")

  return lines.join("\n")
}

export { renderRegistryFile }
