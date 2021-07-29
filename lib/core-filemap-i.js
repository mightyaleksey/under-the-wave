'use strict'

const assert = require('assert')

class IFilemap {
  map (abspath, referer, options) {
    assert(typeof abspath === 'string')
    return null
  }
}

module.exports = {
  IFilemap
}
