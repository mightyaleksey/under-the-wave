'use strict'

const path = require('path')

const { IUrlmap } = require('./core-urlmap-i')
const { ListItem } = require('./core-data-structures')
const { resolveUrl } = require('./core-resolve')

const defaultExtensions = ListItem.from('')

class Urlmap extends IUrlmap {
  constructor (options) {
    super(options)

    this.aliases = options.aliases
    this.cache = null
    this.directories = options.directories
    this.extensions = ListItem.from('')
  }

  map (url, referer) {
    super.map(url, referer)

    const options = { cache: this.cache, extensions: this.extensions }

    if (
      url.startsWith('~/') ||
      url.startsWith('/~/')
    ) {
      const fragment = path.join(this.directories.value, url.substring(url.indexOf('~/') + 2))
      return resolveUrl(fragment, referer, options)
    }

    if (
      url.startsWith('~a') ||
      url.startsWith('/~a')
    ) {
      const offset = url.indexOf('~')
      const alias = url.substring(offset, url.indexOf('/', offset))
      if (!this.aliases.has(alias)) return null

      const fragment = path.join(this.aliases.get(alias), url.substring(offset + alias.length + 1))
      return resolveUrl(fragment, referer, options)
    }

    if (url.startsWith('/')) {
      const fragment = path.join(this.directories.next.value, url)
      const abspath = resolveUrl(fragment, referer, options)
      if (abspath != null) return abspath

      // the motivation here is not run through all extensions to find file in public folder,
      // i.e. no transformations are allowed for static files
      const simplifiedOptions = { cache: this.cache, extensions: defaultExtensions }
      for (const dir of this.directories.next.next) {
        const fragment = path.join(dir, url)
        const abspath = resolveUrl(fragment, referer, simplifiedOptions)
        if (abspath != null) return abspath
      }
    }

    return resolveUrl(url, referer, options)
  }
}

module.exports = {
  Urlmap
}
