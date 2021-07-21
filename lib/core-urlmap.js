'use strict'

const assert = require('assert')

const { ListItem } = require('./core-data-structures')
const { resolveUrl } = require('./core-resolve')

class Urlmap {
  constructor () {
    this.cache = null
    this.extensions = ListItem.from('')
  }

  map (url, referer) {
    assert(typeof url === 'string')
    assert(typeof referer === 'string')

    const options = { cache: this.cache, extensions: this.extensions }
    return resolveUrl(url, referer, options)
  }
}

module.exports = {
  Urlmap
}
