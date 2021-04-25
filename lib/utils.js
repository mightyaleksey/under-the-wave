'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const mimeTypes = require('./mime-types')
const { hash } = require('./hash-utils')
const { isFile } = require('./fs-utils')

const defaultSettings = {
  babel: {
    plugins: [],
    presets: []
  },
  plugins: []
}

function computeSalt (environment, options) {
  const pairs = [
    `cache:${path.relative(options.wd, options.cache)}`,
    `NODE_ENV:${environment.NODE_ENV}`
  ]

  return hash(pairs.join(','))
}

function contentType (abspath) {
  return mimeTypes[path.extname(abspath)] ?? mimeTypes['']
}

function output (asset, options) {
  const name = hash(path.relative(options.wd, asset.path))

  switch (asset.type) {
    case 'css':
    case 'js':
      return path.join(options.output, 'static', asset.type, name + '.' + asset.type)
    case 'html':
      return path.join(options.output, path.relative(options.wd, asset.path))
    default:
      return path.join(options.output, 'static', 'media', name + '.' + asset.type)
  }
}

async function findPackageRoot (dirname) {
  let parsed = { dir: dirname, root: null }
  while (parsed.dir !== parsed.root) {
    const pkg = path.join(parsed.dir, 'package.json')
    if (await isFile(pkg)) return parsed.dir
    parsed = path.parse(parsed.dir)
  }

  return null
}

async function loadPackage (dirname) {
  const pkgpath = path.join(dirname, 'package.json')
  try {
    const pkg = await fs.promises.readFile(pkgpath, 'utf8')
    return JSON.parse(pkg)
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

async function loadSettings (dirname) {
  const pkg = await loadPackage(dirname)
  if (pkg == null) return defaultSettings

  const { babel } = pkg?.wave ?? {}

  return Object.assign({}, defaultSettings, {
    babel: {
      plugins: babel?.plugins ?? [],
      presets: babel?.presets ?? []
    }
  })
}

function type (abspath) {
  assert(abspath != null)
  return path.extname(abspath).substring(1)
}

module.exports = {
  computeSalt,
  contentType,
  findPackageRoot,
  loadSettings,
  output,
  type
}
