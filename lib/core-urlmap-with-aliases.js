'use strict'

const assert = require('assert')
const path = require('path')

const { Urlmap } = require('./core-urlmap')
const { resolveUrl } = require('./core-resolve')

const isAlias = /\/~[a-z]+/i

class UrlmapWithAliases extends Urlmap {
  constructor (options) {
    super(options)

    assert(options.aliases != null)
    this.aliases = options.aliases
  }

  map (url, referer) {
    assert(typeof url === 'string')
    assert(typeof referer === 'string')

    if (isAlias.test(url)) {
      const offset = url.startsWith('./') ? 1 : 0
      const alias = url.substring(offset, url.indexOf('/', offset + 1))

      if (this.aliases.has(alias)) {
        url = path.join(this.aliases.get(alias), url.substring(offset + alias.length + 1))

        const options = { extensions: this.extensions }
        return resolveUrl(url, referer, options)
      }
    }

    return super.map(url, referer)
  }
}

module.exports = {
  UrlmapWithAliases
}
