'use strict'

const assert = require('assert')
const path = require('path')

const { extname } = require('./util-path')

class Filemap {
  constructor (options) {
    assert(options.wd != null)
    this.wd = options.wd
  }

  map (abspath, referer, options) {
    assert(typeof abspath === 'string')

    const customExtension = options?.extension
    if (customExtension != null && !abspath.endsWith(customExtension)) {
      abspath = path.join(
        path.dirname(abspath),
        path.basename(abspath, extname(abspath, true)) + customExtension
      )
    }

    if (referer != null) {
      const directory = path.dirname(referer)
      if (abspath.startsWith(directory)) return './' + path.relative(directory, abspath)
    }

    return '/' + path.relative(this.wd, abspath)
  }
}

module.exports = {
  Filemap
}
