'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { Processing } = require('./core-processing')
const { Storage } = require('./util-storage')
const { extname } = require('./util-path')
const { hash } = require('./util-hash')
const { mkdir } = require('./util-fs')
const { tee } = require('./util-stream')

const salt = Symbol('salt')

class ProcessingWithCache extends Processing {
  static computeSalt (environment) {
    return hash(environment?.NODE_ENV)
  }

  constructor (options, processingFactory) {
    super(options, processingFactory)

    // not sure if it's a good way to get scope, worth to think about proper interface
    assert(typeof processingFactory.settings.scope === 'string')
    const directory = path.join(processingFactory.settings.scope, '.cache')

    this.fileStorage = new Storage({ directory, suffix: '.' + this.cmd })
    this.metaStorage = new Storage({ directory, objectMode: true, suffix: '.' + this.cmd })
    this[salt] = null
  }

  _isValid (meta, mtime) {
    if (meta == null) return false
    return meta.salt === this.salt && meta.mtime === mtime
  }

  async getStreams () {
    const key = `${this.abspath}|${extname(this.url)}`
    const [meta, stats] = await Promise.all([this.metaStorage.get(key), fs.promises.stat(this.abspath)])

    const mtime = new Date(stats.mtime).getTime()

    if (this._isValid(meta, mtime)) {
      meta.dependencies.forEach(url =>
        this.child(url, { captureDependency: true })
      )

      return [fs.createReadStream(this.fileStorage.getPath(key))]
    }

    const streams = await super.getStreams()
    if (streams.length > 1) {
      await mkdir(this.fileStorage.directory)

      const cache = fs.createWriteStream(this.fileStorage.getPath(key))
      cache.once('close', () => {
        const nextMeta = {
          dependencies: this.dependencies().map(d => d.url),
          mtime: mtime,
          salt: this.salt
        }

        this.metaStorage.set(key, nextMeta)
      })

      streams.push(tee(cache))
    }

    return streams
  }

  get salt () {
    if (this[salt] != null) return this[salt]
    return (this[salt] = ProcessingWithCache.computeSalt(this.env))
  }
}

module.exports = {
  ProcessingWithCache
}
