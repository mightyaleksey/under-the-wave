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

const { abc } = require('./url-mapper-utils')

// for alias do check if the folder in workdir
// for node_modules use ~nm{n} prefix, block others
// use internal storage for paths
// use flag to turn it on

class UrlMapper {
  static normalise (rpath) {
    return '/' + rpath
  }

  constructor ({ alias, base, dist }) {
    assert(typeof base === 'string' && base !== '', 'UrlMapper: base directory should be a string')

    this.alias = alias === true
    this.aliases = new Map()
    this.base = base
    this.dist = dist
  }

  dest (abspath) {
    return path.join(this.dist, path.relative(this.base, abspath))
  }

  file (url) {
    const rpath = url.replace(/^\//, '')
    if (rpath.startsWith('~')) {
      const [alias] = /^[~a-z]+/.exec(rpath)
      for (const [dirname, key] of this.aliases) {
        if (alias === key) return rpath.replace(alias, dirname)
      }

      return null
    }

    return path.join(this.base, rpath)
  }

  url (abspath) {
    if (abspath.startsWith(this.base)) {
      return UrlMapper.normalise(path.relative(this.base, abspath))
    }

    // use ~nm{n} prefix for node_modules folder
    if (abspath.includes('node_modules')) {
      const needle = 'node_modules'
      const dirname = abspath.substring(0, abspath.indexOf(needle) + needle.length)
      if (!this.aliases.has(dirname)) this.aliases.set(dirname, `~nm${abc(this.aliases.size)}`)
      const rpath = abspath.replace(dirname, this.aliases.get(dirname))
      return UrlMapper.normalise(rpath)
    }

    throw new Error('Unsupported case')
  }
}

module.exports = UrlMapper
