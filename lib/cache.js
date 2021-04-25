'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { Asset } = require('./data-structures')
const { hash } = require('./hash-utils')
const { parse, stringify } = require('./yaml')
const { stats } = require('./fs-utils')

const metaExt = '.yaml'

// save deps, mtime

class Cache {
  constructor (options) {
    assert(options?.cache != null)
    this.cache = options.cache
    this.salt = options.salt
  }

  async delete (asset) {
    try {
      await Promise.all([
        fs.promises.unlink(this._base(asset)),
        fs.promises.unlink(this._base(asset, metaExt))
      ])
    } catch (e) {
      if (e.code === 'ENOENT') return
      throw e
    }
  }

  // get meta
  async get (asset) {
    assert(asset instanceof Asset)

    const abspath = this._base(asset, metaExt)

    try {
      const m = await fs.promises.readFile(abspath)
      return parse(m.toString('utf8'))
    } catch (e) {
      if (e.code === 'ENOENT') return null
      throw e
    }
  }

  async has (asset) {
    assert(asset instanceof Asset)
    const abspath = this._base(asset, metaExt)
    const s = await stats(abspath)
    return s != null && s.isFile()
  }

  async hasValid (asset) {
    assert(asset instanceof Asset)

    if (!await this.has(asset)) {
      return false
    }

    const abspath = this._base(asset, metaExt)

    try {
      const [s, m] = await Promise.all([
        fs.promises.stat(asset.path),
        fs.promises.readFile(abspath)
      ])

      const mtime = new Date(s.mtime).getTime()
      const meta = parse(m.toString('utf8'))

      return this._valid(mtime, meta)
    } catch (e) {
      if (e.code === 'ENOENT') return false
      throw e
    }
  }

  // set meta
  async set (asset, meta) {
    assert(asset instanceof Asset)

    const s = await fs.promises.stat(asset.path)
    const mtime = new Date(s.mtime).getTime()
    const salt = this.salt

    const abspath = this._base(asset, metaExt)
    const data = stringify(Object.assign({}, meta, { mtime, salt }))
    return fs.promises.writeFile(abspath, data, 'utf8')
  }

  sourcePath (asset) {
    assert(asset instanceof Asset)
    return this._base(asset)
  }

  _base (asset, ext) {
    const extname = ext == null ? '' : ext
    const basename = hash(asset.path) + '.' + asset.type + extname
    return path.join(this.cache, basename)
  }

  _valid (mtime, meta) {
    return this.salt === meta.salt && mtime === meta.mtime
  }
}

module.exports = {
  Cache
}
