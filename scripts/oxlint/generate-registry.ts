/**
 * Generates react-doctor/registry.ts from the React Doctor rules HTML page
 * and oxlint-plugin-react-doctor metadata.
 *
 * Usage: bun run gen:react-doctor-registry [path-to-react-doctor-rules.html]
 */

import fs from "node:fs/promises"
import path from "node:path"

import { buildRuleGroups, sortCategories } from "./lib/group-react-doctor-rules.ts"
import { loadReactDoctorPluginMetadata } from "./lib/load-react-doctor-plugin.ts"
import { parseHtmlRuleGroups } from "./lib/parse-react-doctor-html.ts"
import { renderRegistryFile } from "./lib/render-registry-file.ts"

const scriptDirectory = import.meta.dirname
const defaultHtmlRelativePath = "react-doctor/rules/react-doctor-rules.html"

const htmlPath = process.argv[2] ?? path.join(scriptDirectory, defaultHtmlRelativePath)
const htmlPathForComment = path.relative(scriptDirectory, path.resolve(htmlPath))

const { plugin, version: pluginVersion } = await loadReactDoctorPluginMetadata()
const html = await fs.readFile(htmlPath, "utf8")
const htmlGroups = parseHtmlRuleGroups(html, plugin)
const groups = buildRuleGroups(htmlGroups, plugin)
const sortedCategories = sortCategories(groups)
const outputPath = path.join(scriptDirectory, "react-doctor/registry.ts")

await fs.writeFile(
  outputPath,
  renderRegistryFile({
    htmlPath: htmlPathForComment,
    pluginVersion,
    groups,
    sortedCategories,
  }),
)

const totalRules = Object.values(groups).reduce((count, rules) => count + rules.length, 0)

console.log(`Wrote ${outputPath}`)
console.log(
  sortedCategories
    .map((category) => {
      const count = groups[category]?.length ?? 0
      return `  ${category}: ${count}`
    })
    .join("\n"),
)
console.log(`Total rules: ${totalRules}`)
