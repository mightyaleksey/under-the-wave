'use strict'

const assert = require('assert')
const path = require('path')

const { Filemap } = require('./core-filemap')
const { hash } = require('./util-hash')
const { foldLevels } = require('./util-path')

class FilemapWithAliases extends Filemap {
  constructor (options) {
    super(options)

    assert(options.aliases != null)
    this.aliases = options.aliases
    assert(typeof options.packageScope === 'string')
    this.packageScope = options.packageScope
  }

  map (abspath, referer) {
    assert(typeof abspath === 'string')

    if (abspath.startsWith(this.wd)) {
      return super.map(abspath, referer)
    }

    if (abspath.startsWith(this.packageScope)) {
      const middleRight = path.relative(this.packageScope, abspath)
      const right = foldLevels(path.relative(this.wd, abspath))
      const middle = middleRight.substring(0, middleRight.lastIndexOf(right))

      const alias = `/~${hash(middle)}` // todo a readable solution
      if (!this.aliases.has(alias)) {
        const base = path.join(this.packageScope, middle.substring(0, middle.length - path.sep.length))
        this.aliases.set(alias, base)
      }

      return path.join(alias, right)
    }

    if (abspath.includes('node_modules')) {
      const base = abspath.substring(0, abspath.indexOf('node_modules') + 'node_modules'.length)
      for (const [alias, directory] of this.aliases) {
        if (base === directory) return path.join(alias, abspath.substring(base.length + 1))
      }
    }

    return null
  }
}

module.exports = { FilemapWithAliases }
