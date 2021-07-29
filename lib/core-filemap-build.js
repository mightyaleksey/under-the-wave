'use strict'

const path = require('path')

const { IFilemap } = require('./core-filemap-i')
const { extname } = require('./util-path')
const { hash } = require('./util-hash')

class Filemap extends IFilemap {
  constructor (options) {
    super(options)

    this.packageScope = options.packageScope
    this.staticDirs = options.staticDirs
    this.wd = options.wd
  }

  map (abspath, referer) {
    super.map(abspath, referer)

    if (this.staticDirs != null) {
      for (const directory of this.staticDirs) {
        if (abspath.startsWith(directory)) return '/' + path.relative(directory, abspath)
      }
    }

    const ext = extname(abspath)
    const genericName = hash(path.relative(this.packageScope, abspath))

    switch (ext) {
      case '.html':
        return '/' + path.relative(this.wd, abspath)
      case '.css':
      case '.js':
        return '/' + path.join('static', ext.substring(1), genericName + ext)
      default:
        return '/' + path.join('static', 'media', genericName + ext)
    }
  }
}

module.exports = {
  Filemap
}
