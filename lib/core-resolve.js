'use strict'

const path = require('path')

const { ListItem } = require('./core-data-structures')
const { basenames } = require('./util-path')
const { isDirectorySync, isFileSync, requireJson } = require('./util-fs')

function resolveAsDirectory (base, options) {
  const packageSpec = requireJson(path.join(base, 'package.json'))

  if (packageSpec != null && packageSpec.main != null) {
    const main = path.join(base, packageSpec.main)

    return (
      resolveAsFile(main, options) ??
      resolveAsFile(path.join(main, 'index'), options) ??
      null
    )
  }

  return (
    resolveAsFile(path.join(base, 'index'), options) ??
    null
  )
}

function resolveAsFile (base, options) {
  for (const basepath of basenames(base)) {
    for (const extension of options.extensions) {
      const abspath = basepath + extension
      if (isFileSync(abspath)) return abspath
    }
  }

  return null
}

function nodeModules (directory, options) {
  const cache = options?.cache
  const head = new ListItem(null)

  let cursor = head
  let parsed = { dir: directory, root: null }
  while (parsed.dir !== parsed.root) {
    if (cache != null && cache[parsed.dir] != null) {
      cursor.next = cache[parsed.dir]
      break
    }

    const abspath = path.join(parsed.dir, 'node_modules')
    if (isDirectorySync(abspath)) {
      cursor.next = new ListItem(abspath)
      cursor = cursor.next
      if (cache != null) cache[parsed.dir] = cursor
    }

    parsed = path.parse(parsed.dir)
  }

  // check global dirs?

  cursor = head.next
  head.next = null

  if (cache != null && cache[directory] == null) {
    cache[directory] = cursor
  }

  return cursor
}

function resolveAsNodeModule (url, referer, options) {
  const directories = nodeModules(path.dirname(referer), options)
  if (directories == null) return null

  for (const dir of directories) {
    const base = path.join(dir, url)
    const abspath = (
      resolveAsFile(base, options) ??
      resolveAsDirectory(base, options) ??
      null
    )

    if (abspath != null) return abspath
  }

  return null
}

function resolveUrl (url, referer, options) {
  if (
    url.startsWith('../') ||
    url.startsWith('./') ||
    url.startsWith('/')
  ) {
    const base = path.resolve(path.dirname(referer), url)

    return (
      resolveAsFile(base, options) ??
      resolveAsDirectory(base, options) ??
      null
    )
  }

  return (
    resolveAsNodeModule(url, referer, options) ??
    null
  )
}

module.exports = {
  nodeModules,
  resolveUrl
}
