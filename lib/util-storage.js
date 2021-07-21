'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { hash } = require('./util-hash')
const { mkdir } = require('./util-fs')
const { parse, stringify } = require('./util-yaml')

const suffix = Symbol('suffix')

class Storage {
  constructor (options) {
    assert(typeof options.directory === 'string')
    this.directory = options.directory
    this.objectMode = options.objectMode === true

    this[suffix] = (options.suffix || '') + (this.objectMode ? '.yaml' : '')
  }

  getPath (key) {
    return path.join(this.directory, hash(key) + this[suffix])
  }

  async delete (key) {
    assert(typeof key === 'string')

    const abspath = this.getPath(key)
    return fs.promises.unlink(abspath)
  }

  async get (key) {
    assert(typeof key === 'string')

    const abspath = this.getPath(key)

    try {
      const buffer = await fs.promises.readFile(abspath)
      const content = buffer.toString('utf8')
      return this.objectMode ? parse(content) : content
    } catch (err) {
      if (err.code === 'ENOENT') return null
      throw err
    }
  }

  async set (key, value) {
    assert(typeof key === 'string')
    assert(this.objectMode
      ? typeof value === 'object'
      : typeof value === 'string'
    )

    const abspath = this.getPath(key)
    const content = this.objectMode ? stringify(value) : value

    await mkdir(path.dirname(abspath))
    return fs.promises.writeFile(abspath, Buffer.from(content))
  }
}

module.exports = {
  Storage
}
