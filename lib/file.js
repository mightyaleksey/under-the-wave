'use strict'

const assert = require('assert')

class File {
  constructor (abspath) {
    assert(typeof abspath === 'string' && abspath !== '', 'File: abspath should be a string')
    this.path = abspath
    this.content = null
  }
}

module.exports = File
