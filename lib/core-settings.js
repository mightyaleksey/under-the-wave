'use strict'

const path = require('path')

const { requireJson } = require('./util-fs')

function loadCustomPlugins (plugins, packageScope) {
  if (!Array.isArray(plugins)) return []

  return plugins.map(plugin => {
    const pluginPath = path.join(packageScope, plugin)
    return require(pluginPath)
  })
}

async function loadPackageSettings (directory) {
  const packageSpec = requireJson(path.join(directory, 'package.json'))
  const settings = { scope: directory }

  if (packageSpec == null) return settings
  if (packageSpec.name != null) settings.name = packageSpec.name
  if (packageSpec.babel != null) settings.babel = packageSpec.babel
  if (packageSpec.wave != null) settings.wave = packageSpec.wave
  return settings
}

module.exports = {
  loadCustomPlugins,
  loadPackageSettings
}
