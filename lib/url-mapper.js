'use strict'

/**
 * Valid URI characters are characters belonging to the US-ASCII character set.
 * These characters include:
 * - digits (0-9)
 * - letters (A-Z, a-z)
 * - special characters ('-', '.', '_', '~')
 */

const assert = require('assert')
const path = require('path')

const { abc, normalize } = require('./url-mapper-utils')

class UrlMapper {
  constructor ({ alias, base, nodeModules }) {
    assert(typeof base === 'string' && base !== '', 'UrlMapper: base directory should be a string')
    assert(alias === true ? typeof nodeModules === 'function' : true)

    this.alias = alias === true
    this.aliases = new Map()
    this.base = base

    if (alias === true) {
      // If folder is not in workdir, we use alias.
      // Aliases are applied for node_modules folders with ~nm{n} prefix,
      // others are ignored
      const dirs = nodeModules(base)
      for (const dir of dirs) {
        if (dir.startsWith(base)) continue
        // use ~nm{n} prefix for node_modules folder
        this.aliases.set(`~nm${abc(this.aliases.size)}`, dir)
      }
    }
  }

  file (url) {
    const rpath = url.replace(/^\//, '')

    if (rpath.startsWith('~')) {
      assert(this.alias === true)
      const [alias] = /^[~a-z]+/.exec(rpath)
      if (this.aliases.has(alias)) {
        return rpath.replace(alias, this.aliases.get(alias))
      }

      return null
    }

    return path.join(this.base, rpath)
  }

  url (abspath) {
    if (abspath.startsWith(this.base)) {
      return normalize(path.relative(this.base, abspath))
    }

    if (abspath.includes('node_modules')) {
      const needle = 'node_modules'
      const dirname = abspath.substring(0, abspath.indexOf(needle) + needle.length)
      for (const [alias, mpath] of this.aliases) {
        if (dirname === mpath) return normalize(abspath.replace(mpath, alias))
      }
    }

    return null
  }
}

module.exports = UrlMapper
