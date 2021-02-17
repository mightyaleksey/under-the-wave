'use strict'

const fs = require('fs')
const path = require('path')

const { List } = require('./data-types')
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

function nodeModulesPaths (dirname) {
  // limit by packageScope?
  const paths = [dirname]
  let parsedPath = path.parse(dirname)

  while (parsedPath.dir !== parsedPath.root) {
    paths.push(parsedPath.dir)
    parsedPath = path.parse(parsedPath.dir)
  }

  paths.push(parsedPath.root)

  const nodeModules = paths.map(dir => path.join(dir, 'node_modules')).filter(isdirsync)
  return new List(...nodeModules)
}

function resolveAsFileSync (abspath, extensions) {
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

function resolveNodeModulesSync (to, dirname) {
  const dirs = nodeModulesPaths(dirname)
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
function requireResolveSync (to, from) {
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
    resolveNodeModulesSync(to, path.dirname(from)) ??
    null
  )
}

module.exports = {
  requireResolveSync
}
