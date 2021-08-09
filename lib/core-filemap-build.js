'use strict'

const path = require('path')

const { IFilemap } = require('./core-filemap-i')
const { extname } = require('./util-path')
const { hash } = require('./util-hash')

class Filemap extends IFilemap {
  constructor (options) {
    super(options)

    const iterator = options.directories.values()
    this.scopedir = iterator.next().value
    this.workdir = iterator.next().value
    this.publicdir = iterator.next().value
  }

  map (abspath, referer) {
    super.map(abspath, referer)

    if (abspath.startsWith(this.publicdir)) {
      return '/' + path.relative(this.publicdir, abspath)
    }

    const ext = extname(abspath)
    const genericName = hash(path.relative(this.scopedir, abspath))

    switch (ext) {
      case '.html':
        return '/' + path.relative(this.workdir, abspath)
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
