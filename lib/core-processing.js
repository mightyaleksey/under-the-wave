'use strict'

const assert = require('assert')
const fs = require('fs')
const { inspect } = require('util')

const { Context } = require('./core-context')
const { createBufferStream, createTransformStream } = require('./util-stream')
const { extname } = require('./util-path')

const context = Symbol('context')
const factory = Symbol('factory')
const customInspect = inspect.custom ?? 'inspect'

class Processing {
  constructor (options, processingFactory) {
    assert(['build', 'serve', 'test'].includes(options.cmd))
    this.cmd = options.cmd
    assert(typeof options.url === 'string')
    this.url = options.url
    assert(typeof options.abspath === 'string')
    this.abspath = options.abspath
    assert(Array.isArray(options.plugins))
    this.plugins = options.plugins

    this.env = null
    this.filemap = null
    this.settings = null

    this.deps = new Map()
    this[context] = new Context(this)
    this[factory] = processingFactory
  }

  child (url, options) {
    const childProcessing = this[factory].create(url, this.abspath)

    if (childProcessing != null && options?.captureDependency === true) {
      this.deps.set(childProcessing.abspath, childProcessing)
    }

    return childProcessing
  }

  dependencies () {
    return [...this.deps.values()]
  }

  async getStreams () {
    const streams = [fs.createReadStream(this.abspath)]
    const identity = this.plugins.length === 1 && this.plugins[0].type === 'identity'

    if (!identity && this.plugins.length > 0) {
      streams.push(createBufferStream())

      this.plugins.forEach(plugin => {
        streams.push(createTransformStream(plugin.transform, this[context], { objectMode: true }))
      })
    }

    return streams
  }

  publicUrl () {
    const options = { extension: extname(this.url) }
    return this.filemap.map(this.abspath, null, options)
  }

  [customInspect] (depth, options) {
    return `${this.constructor.name}:\n` +
      `- url → ${inspect(this.url, options)}\n` +
      `- abspath → ${inspect(this.abspath, options)}\n` +
      `- plugins → ${inspect(this.plugins.map(p => p.type), options)}`
  }
}

module.exports = {
  Processing
}
