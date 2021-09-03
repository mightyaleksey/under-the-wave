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

class Cache {
  constructor (directory, suffix = '', salt = '') {
    // base path
    this.directory = directory
    // transformed content
    this.fileStorage = new Storage({ directory, suffix })
    // supportive information, dependencies for example
    this.metaStorage = new Storage({ directory, objectMode: true, suffix })
    this.salt = salt
  }

  generateKey (abspath, url) {
    return `${abspath}|${extname(url)}`
  }

  generatePath (abspath, url) {
    const key = this.generateKey(abspath, url)
    return this.fileStorage.getPath(key)
  }

  async getMeta (abspath, url) {
    const key = this.generateKey(abspath, url)
    const [meta, stats] = await Promise.all([
      this.metaStorage.get(key),
      fs.promises.stat(abspath)
    ])

    const mtime = new Date(stats.mtime).getTime()

    if (
      meta != null &&
      meta.mtime === mtime &&
      meta.salt === this.salt
    ) return meta

    return null
  }

  async setMeta (abspath, url, data) {
    const key = this.generateKey(abspath, url)
    const stats = await fs.promises.stat(abspath)
    const mtime = new Date(stats.mtime).getTime()
    const salt = this.salt

    const meta = Object.assign({}, data, { mtime, salt })
    return this.metaStorage.set(key, meta)
  }
}

class ProcessingWithCache extends Processing {
  constructor (options, processingFactory) {
    super(options, processingFactory)

    assert(typeof processingFactory.settings.scope === 'string')
    const directory = path.join(processingFactory.settings.scope, '.cache')
    const suffix = '.' + this.cmd
    const salt = hash(this.env?.NODE_ENV)

    this.cache = new Cache(directory, suffix, salt)
  }

  async transform (dest) {
    const meta = await this.cache.getMeta(this.abspath, this.url)
    if (meta != null) {
      meta.dependencies.forEach(url => {
        // add dependency to the list and build alias
        this.resolve(url).publicUrl()
      })

      const abspath = this.cache.generatePath(this.abspath, this.url)
      fs.createReadStream(abspath).pipe(dest)

      return
    }

    await mkdir(this.cache.directory)
    await super.transform(dest)

    const dependencies = [...this.dependencies.values()].map(d => d.url)
    const updatedMeta = { dependencies }
    this.cache.setMeta(this.abspath, this.url, updatedMeta)
  }

  _streams () {
    const streams = super._streams()
    // why bother caching the source file without any transforms?
    if (streams.length === 1) return streams

    const abspath = this.cache.generatePath(this.abspath, this.url)
    const cacheStream = fs.createWriteStream(abspath)
    streams.push(tee(cacheStream))

    return streams
  }
}

module.exports = {
  ProcessingWithCache
}
