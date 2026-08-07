import fs from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"

import type { ReactDoctorPlugin } from "./react-doctor-plugin.ts"

import { isPackageJson, isReactDoctorPlugin } from "./react-doctor-plugin.ts"

const require = createRequire(import.meta.url)

const loadReactDoctorPlugin = (): ReactDoctorPlugin => {
  const plugin: unknown = require("oxlint-plugin-react-doctor")

  if (!isReactDoctorPlugin(plugin)) {
    throw new Error("Invalid oxlint-plugin-react-doctor export")
  }

  return plugin
}

const loadPluginVersion = async (pluginEntry: string): Promise<string> => {
  const packageJson: unknown = JSON.parse(
    await fs.readFile(path.join(path.dirname(pluginEntry), "../package.json"), "utf8"),
  )

  if (!isPackageJson(packageJson)) {
    throw new Error("Invalid oxlint-plugin-react-doctor package.json")
  }

  return packageJson.version
}

const loadReactDoctorPluginMetadata = async (): Promise<{
  plugin: ReactDoctorPlugin
  version: string
}> => {
  const plugin = loadReactDoctorPlugin()
  const pluginEntry = require.resolve("oxlint-plugin-react-doctor")
  const version = await loadPluginVersion(pluginEntry)

  return { plugin, version }
}

export { loadReactDoctorPluginMetadata }
