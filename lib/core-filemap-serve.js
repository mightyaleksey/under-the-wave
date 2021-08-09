'use strict'

const path = require('path')

const { IFilemap } = require('./core-filemap-i')
const { hash } = require('./util-hash')
const { foldLevels } = require('./util-path')

const workdir = Symbol('workdir')

class Filemap extends IFilemap {
  constructor (options) {
    super(options)

    const directories = options.directories

    this.aliases = options.aliases
    this.packageScope = directories.value
    this.staticDirs = directories.next.next

    this[workdir] = path.relative(this.packageScope, directories.next.value)
  }

  map (abspath, referer) {
    super.map(abspath, referer)

    if (this.staticDirs != null) {
      for (const directory of this.staticDirs) {
        if (abspath.startsWith(directory)) return '/' + path.relative(directory, abspath)
      }
    }

    const relative = path.relative(this.packageScope, abspath)

    if (relative.startsWith(this[workdir])) {
      return '/' + path.relative(this[workdir], relative)
    }

    if (relative.startsWith('../')) {
      if (relative.includes('node_modules')) {
        const base = abspath.substring(0, abspath.indexOf('node_modules') + 'node_modules'.length)
        for (const [alias, directory] of this.aliases) {
          if (base === directory) return '/' + path.join(alias, abspath.substring(base.length + 1))
        }
      }

      return null
    }

    const right = foldLevels(path.relative(this[workdir], relative))
    const middle = relative.substring(0, relative.lastIndexOf(right))

    const alias = `~a${hash(middle)}` // todo a readable solution
    if (!this.aliases.has(alias)) {
      const base = path.join(this.packageScope, middle.substring(0, middle.length - path.sep.length))
      this.aliases.set(alias, base)
    }

    return '/' + path.join(alias, right)
  }

  output (relative) {
    return relative
  }
}

module.exports = {
  Filemap
}
