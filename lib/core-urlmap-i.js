'use strict'

const assert = require('assert')

class IUrlmap {
  map (url, referer) {
    assert(typeof url === 'string')
    assert(typeof referer === 'string')
    return null
  }
}

module.exports = {
  IUrlmap
}
