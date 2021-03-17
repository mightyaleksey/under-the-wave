'use strict'

const fs = require('fs')
const path = require('path')

const { ListItem, List } = require('./data-structures')
const { isdirsync, isfilesync } = require('./file-utils')

const fileExts = new List('', '.js', '.json')
const indexExts = new List('.js', '.json')

function loadPackageSync (abspath) {
  const pkgpath = path.join(abspath, 'package.json')
  try {
    const pkg = fs.readFileSync(pkgpath, 'utf8')
    return JSON.parse(pkg)
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

function nodeModulesPaths (dirname, cache) {
  const head = new ListItem(null)

  let item = head
  let parsed = { dir: dirname, root: null }
  while (parsed.dir !== parsed.root) {
    if (cache[parsed.dir] != null) {
      item.next = cache[parsed.dir]
      break
    }

    const mdir = path.join(parsed.dir, 'node_modules')
    if (isdirsync(mdir)) {
      item.next = new ListItem(mdir)
      item = item.next
      cache[parsed.dir] = item
    }

    parsed = path.parse(parsed.dir)
  }

  // check global dirs?

  item = head.next
  head.next = null

  if (cache[dirname] == null) {
    cache[dirname] = item
  }

  return item
}

function resolveAsFileSync (abspath, extensions) {
  // idea not to check all extensions for resolveNodeModulesSync call if we know it's a directory.
  // problem: wont load a.js if a folder exists as well.
  for (const ext of extensions) {
    if (isfilesync(abspath + ext)) return abspath + ext
  }

  return null
}

function resolveAsDirectorySync (abspath) {
  const pkg = loadPackageSync(abspath)
  if (pkg != null && pkg.main != null) {
    return (
      resolveAsFileSync(path.join(abspath, pkg.main), fileExts) ??
      resolveAsFileSync(path.join(abspath, pkg.main, 'index'), indexExts) ??
      null
    )
  }

  return (
    resolveAsFileSync(path.join(abspath, 'index'), indexExts) ??
    null
  )
}

function resolvePackageExportsSync (abspath) {
  /* todo */
  return null
}

function resolveNodeModulesSync (to, dirname, cache) {
  const dirs = nodeModulesPaths(dirname, cache)
  if (dirs == null) return null

  for (const dir of dirs) {
    const abspath = (
      resolvePackageExportsSync(path.join(dir, to)) ??
      resolveAsFileSync(path.join(dir, to), fileExts) ??
      resolveAsDirectorySync(path.join(dir, to)) ??
      null
    )

    if (abspath) return abspath
  }

  return null
}

// steps https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_all_together
function requireResolveSync (to, from, cache) {
  if (to.startsWith('/')) from = '/'
  if (
    to.startsWith('../') ||
    to.startsWith('./') ||
    to.startsWith('/')
  ) {
    return (
      // how to handle x+y properly? check require.resolve. Prob should be path.join(path.dirname(y), x)
      resolveAsFileSync(path.join(path.dirname(from), to), fileExts) ??
      resolveAsDirectorySync(path.join(path.dirname(from), to)) ??
      null
    )
  }
  return (
    // resolvePackageSelfSync() ??
    resolveNodeModulesSync(to, path.dirname(from), cache) ??
    null
  )
}

module.exports = {
  nodeModulesPaths,
  requireResolveSync
}
