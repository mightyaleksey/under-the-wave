'use strict'

const assert = require('assert')
const path = require('path')

const { Filemap } = require('./core-filemap')
const { hash } = require('./util-hash')

class FilemapWithOutput extends Filemap {
  constructor (options) {
    super(options)

    assert(typeof options.packageScope === 'string')
    this.packageScope = options.packageScope
  }

  map (abspath, referer, options) {
    assert(typeof abspath === 'string')

    const ext = options?.extension ?? path.extname(abspath)
    const genericName = hash(path.relative(this.packageScope, abspath))

    switch (ext) {
      case '.html':
        return super.map(abspath, referer, options)
      case '.css':
      case '.js':
        return path.join('/static', ext.substring(1), genericName + ext)
      default:
        return path.join('/static/media', genericName + ext)
    }
  }
}

module.exports = {
  FilemapWithOutput
}
