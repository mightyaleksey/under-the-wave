'use strict'

const assert = require('assert')

const { LRUCache } = require('./data-structures')
const { nodeModulesPaths, requireResolveSync } = require('./resolver-utils')

// commonjs https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_all_together
// ecmascript https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_resolver_algorithm_specification

class Resolver {
  constructor () {
    this.inner = {}
    this.lru = new LRUCache(50)
  }

  nodeModules (dirname) {
    return nodeModulesPaths(dirname, this.inner)
  }

  resolveSync (abspath, file) {
    // On high level cache successful resolutions, like "import x from react". Helps with duplicates.
    // On lower level cache resolved node_modules dirs, since it usually has the same result.
    const key = `${file}:${abspath}`
    if (this.lru.has(key)) return this.lru.get(key)

    const mpath = requireResolveSync(file, abspath, this.inner)
    assert(mpath != null, `failed to resolve "${file}" from "${abspath}"`)

    this.lru.set(key, mpath)

    return mpath
  }
}

module.exports = Resolver
