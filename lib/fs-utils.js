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
  return 'other'
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
  isdirsync,
  isfile,
  isfilesync,
  sourceType,
  splitPath
}
