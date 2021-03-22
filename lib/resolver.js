'use strict'

const assert = require('assert')

const { LRUCache } = require('./data-structures')
const { nodeModulesPaths, requireResolveSync } = require('./resolver-utils')

// commonjs https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_all_together
// ecmascript https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_resolver_algorithm_specification

const $mcache = Symbol('mcache')
const $rcache = Symbol('rcache')

class Resolver {
  constructor () {
    // todo add possibility to turn off caching
    this[$mcache] = {}
    this[$rcache] = new LRUCache(50)
  }

  nodeModules (dirname) {
    return nodeModulesPaths(dirname, this[$mcache])
  }

  resolveSync (abspath, file) {
    // On high level cache successful resolutions, like "import x from react". Helps with duplicates.
    // On lower level cache resolved node_modules dirs, since it usually has the same result.
    const key = `${file}:${abspath}`
    if (this[$rcache].has(key)) return this[$rcache].get(key)

    const mpath = requireResolveSync(file, abspath, this[$mcache])
    assert(mpath != null, `failed to resolve "${file}" from "${abspath}"`)

    this[$rcache].set(key, mpath)

    return mpath
  }
}

module.exports = Resolver
