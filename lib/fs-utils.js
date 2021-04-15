'use strict'

const fs = require('fs')
const path = require('path')

const mimeTypes = require('./mime-types')

function contentType (abspath) {
  return mimeTypes[path.extname(abspath)] ?? mimeTypes['']
}

function sourceType (url) {
  if (url.pathname.endsWith('.mjs')) return 'module'
  if (url.pathname.endsWith('.js')) return url.searchParams.get('t') === 'm' ? 'module' : 'script'
  if (url.pathname.endsWith('.html')) return 'markup'
  return path.extname(url.pathname) ?? 'other'
}

async function findPackageScope (dirname) {
  let parsed = { dir: dirname, root: null }
  while (parsed.dir !== parsed.root) {
    const pkg = path.join(parsed.dir, 'package.json')
    if (await isfile(pkg)) return pkg
    parsed = path.parse(parsed.dir)
  }

  return null
}

async function loadJson (abspath) {
  try {
    const json = await fs.promises.readFile(abspath, 'utf8')
    return JSON.parse(json)
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

async function isfile (abspath) {
  try {
    const stats = await fs.promises.stat(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function isdirsync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isDirectory()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function isfilesync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function splitPath (abspath) {
  const ext = path.extname(abspath)
  return [abspath.substring(0, abspath.length - ext.length), ext]
}

module.exports = {
  contentType,
  sourceType,
  findPackageScope,
  loadJson,
  isdirsync,
  isfile,
  isfilesync,
  splitPath
}
