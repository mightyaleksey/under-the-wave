'use strict'

const path = require('path')

const { IUrlmap } = require('./core-urlmap-i')
const { ListItem } = require('./core-data-structures')
const { isFileSync } = require('./util-fs')
const { resolveUrl } = require('./core-resolve')

class Urlmap extends IUrlmap {
  static isAliasPath (url) {
    return /^(?:\.\/)?~[a-z0-9]+/i.test(url)
  }

  static isRootPath (url) {
    return (
      url.startsWith('./~/') ||
      url.startsWith('~/')
    )
  }

  constructor (options) {
    super(options)

    this.aliases = options.aliases
    this.cache = null
    this.extensions = ListItem.from('')
    this.packageScope = options.packageScope
    this.staticDirs = options.staticDirs
  }

  map (url, referer) {
    super.map(url, referer)

    // resolved aliases or package path will start from "/~",
    // thus turn it into "./~" to properly resolve it
    if (url.startsWith('/~')) url = '.' + url

    const options = { cache: this.cache, extensions: this.extensions }

    if (url.startsWith('/')) {
      const abspath = resolveUrl(url, referer, options)
      if (abspath != null) return abspath

      if (this.staticDirs != null) {
        for (const directory of this.staticDirs) {
          const staticPath = path.join(directory, url)
          if (isFileSync(staticPath)) return staticPath
        }
      }

      return null
    }

    if (Urlmap.isAliasPath(url)) {
      const offset = url.indexOf('~')
      const alias = url.substring(offset, url.indexOf('/', offset))

      if (this.aliases.has(alias)) {
        url = path.join(this.aliases.get(alias), url.substring(offset + alias.length + 1))
      }
    }

    if (Urlmap.isRootPath(url)) {
      const offset = url.indexOf('~/')
      const base = url.substring(offset + 2)
      url = path.join(this.packageScope, base)
    }

    return resolveUrl(url, referer, options)
  }
}

module.exports = {
  Urlmap
}
