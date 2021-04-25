'use strict'

const assert = require('assert')
const path = require('path')

const { ListItem } = require('./data-structures')
const { abc } = require('./hash-utils')
const { nodeModulesPaths, resolve } = require('./resolve')

class UrlMap {
  constructor (options) {
    assert(options?.wd != null)
    this.aliases = new Map()
    this.options = {
      cache: {},
      exts: ListItem.from('', '.js')
    }
    this.wd = options.wd

    const dirs = nodeModulesPaths(this.wd, this.options.cache)
    for (const dir of dirs) {
      if (dir.startsWith(this.wd)) continue
      const alias = `~nm${abc(this.aliases.size)}` // mb add root slash?
      this.aliases.set(alias, dir)
    }
  }

  find (url, referrer) {
    assert(url != null)
    // add fake filename to make it work, since it expects file instead of dir
    if (referrer == null) referrer = path.join(this.wd, '_')

    if (url.startsWith('./~')) {
      const [, alias] = /^\.\/([~a-z]+)/.exec(url)
      if (this.aliases.has(alias)) {
        return url.replace('./' + alias, this.aliases.get(alias))
      }

      assert(false, 'invalid alias')
    }

    return resolve(url, referrer, this.options)
  }

  url (abspath, referrer) {
    assert(abspath != null)

    // if (referrer != null) {
    //   const dirname = path.dirname(referrer)
    //   if (abspath.startsWith(dirname)) return './' + path.relative(dirname, referrer)
    // }

    if (abspath.startsWith(this.wd)) {
      return '/' + path.relative(this.wd, abspath)
    }

    const needle = 'node_modules'
    if (abspath.includes(needle)) {
      const dir = abspath.substring(0, abspath.indexOf(needle) + needle.length)
      for (const [alias, mpath] of this.aliases) {
        if (dir === mpath) return '/' + abspath.replace(mpath, alias)
      }

      assert(false, 'invalid alias')
    }

    assert(false, 'invariant')
  }
}

module.exports = {
  UrlMap
}
