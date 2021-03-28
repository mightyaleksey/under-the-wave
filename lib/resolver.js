'use strict'

const { ListItem } = require('./data-structures')
const { nodeModulesPaths, requireResolveSync } = require('./resolver-utils')

class Resolver {
  constructor () {
    this.fileExts = ListItem.from('', '.js', '.json')
    this.nmcache = {}
  }

  nodeModules (dirname) {
    return nodeModulesPaths(dirname, this.nmcache)
  }

  resolveModule (abspath, file) {
    return requireResolveSync(file, abspath, this.fileExts, this.nmcache)
  }
}

module.exports = Resolver
