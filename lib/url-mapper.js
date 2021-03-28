'use strict'

const path = require('path')

const { abc } = require('./utils')

class UrlMapper {
  constructor (base, nodeModules) {
    this.aliases = new Map()
    this.base = base

    if (typeof nodeModules === 'function') {
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
    if (url.startsWith('/~')) {
      const [, alias] = /^\/([~a-z]+)/.exec(url)
      if (this.aliases.has(alias)) {
        return url.replace('/' + alias, this.aliases.get(alias))
      }
    }

    return this.base + url
  }

  url (abspath, from) {
    if (from != null) {
      const dirname = path.dirname(from)
      if (abspath.startsWith(dirname)) return './' + path.relative(dirname, abspath)
    }

    if (abspath.startsWith(this.base)) {
      return '/' + path.relative(this.base, abspath)
    }

    if (abspath.includes('node_modules')) {
      const needle = 'node_modules'
      const dirname = abspath.substring(0, abspath.indexOf(needle) + needle.length)
      for (const [alias, mpath] of this.aliases) {
        if (dirname === mpath) return '/' + abspath.replace(mpath, alias)
      }
    }

    // avoid duplicates? think how to handle
    return '/' + path.relative(this.base, abspath)
  }
}

module.exports = UrlMapper
