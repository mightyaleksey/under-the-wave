'use strict'

const path = require('path')

const { requireJson } = require('./util-fs')

async function loadPackageSettings (directory) {
  const packageSpec = requireJson(path.join(directory, 'package.json'))
  const settings = { scope: directory }

  if (packageSpec == null) return settings
  if (packageSpec.babel != null) settings.babel = packageSpec.babel
  return settings
}

module.exports = {
  loadPackageSettings
}
