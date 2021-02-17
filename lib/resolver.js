'use strict'

const assert = require('assert')

const { List } = require('./data-types')
const { isfile } = require('./file-utils')
const { requireResolveSync } = require('./resolver-utils')

// commonjs https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_all_together
// ecmascript https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_resolver_algorithm_specification
// https://github.com/css-modules/postcss-modules-resolve-imports/blob/master/src/resolveModule.js#L101

const $fallbacks = Symbol('fallbacks')

class Resolver {
  constructor () {
    this[$fallbacks] = {
      '.js': new List('', '.js', '.json'),
      '': new List('')
    }
  }

  // check file existence + handle aliases
  async find (file, context) {
    const fallbacks = this[$fallbacks][context] ?? this[$fallbacks]['']

    for (const ext of fallbacks) {
      const abspath = file + ext
      if (await isfile(abspath)) return abspath
    }

    return null
  }

  // resolve module path + handle aliases
  resolveSync (abspath, file) {
    const mpath = requireResolveSync(file, abspath)
    assert(mpath != null, `failed to resolve "${file}" from "${abspath}"`)
    return mpath
  }
}

module.exports = Resolver
