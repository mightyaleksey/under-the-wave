'use strict'

const fs = require('fs')
const path = require('path')
const { inspect } = require('util')
const { pipeline } = require('stream/promises')

const { Context } = require('./core-context')
const { createBufferStream, createTransformStream } = require('./util-stream')
const { extname } = require('./util-path')

const customInspect = inspect.custom ?? 'inspect'
const internal = /^\/-internal-\//
const protocol = /^[a-z]{2,6}:\/\//i

const context = Symbol('context')
const factory = Symbol('factory')

class Processing {
  constructor (options, processingFactory) {
    // mandatory
    this.url = options.url
    this.abspath = options.abspath
    this.plugins = options.plugins

    // helpers
    this.filemap = options.filemap
    this.cmd = options.cmd
    this.env = options.env
    this.settings = options.settings

    // internal
    this.dependencies = new Map()
    this[context] = new Context(this)
    this[factory] = processingFactory
  }

  get id () {
    return this.publicUrl()
  }

  publicUrl (referer) {
    const ext = extname(this.url) ?? extname(this.abspath)
    const request = !this.abspath.endsWith(ext)
      ? path.join(
          path.dirname(this.abspath),
          path.basename(this.abspath, extname(this.abspath, true)) + ext
        )
      : this.abspath

    const url = this.filemap.map(request, null)
    if (url.endsWith('index.html') && referer != null) {
      return url.substring(0, url.length - 'index.html'.length)
    }

    return url
  }

  resolve (url, options) {
    const dependency = this[factory].resolve(url, this.abspath)

    if (dependency != null && options?.captureDependency === true) {
      this.dependencies.set(dependency.abspath, dependency)
    }

    return dependency
  }

  requestDependency (url) {
    if (internal.test(url)) throw new Error('requestDependency does not handle internal files')
    if (protocol.test(url)) throw new Error('requestDependency does not support urls')

    const dependency = this.resolve(url, { captureDependency: false })
    if (dependency == null) return null

    const bufferStream = createBufferStream()
    return dependency.transform()
      .then(streams => pipeline(...streams, bufferStream))
      .then(() => bufferStream.buffer.toString('utf8'))
  }

  resolveDependency (url) {
    if (internal.test(url)) return url
    if (protocol.test(url)) return url

    const dependency = this.resolve(url, { captureDependency: true })
    if (dependency == null) console.log('can not resolve', url)

    return dependency?.publicUrl(this.abspath) ?? url
  }

  async transform () {
    const streams = [fs.createReadStream(this.abspath)]
    const plugins = this.plugins.filter(plugin => plugin.type !== 'identity')

    if (plugins.length > 0) {
      streams.push(createBufferStream())

      plugins.forEach(plugin => {
        streams.push(createTransformStream(plugin.transform, this[context], { objectMode: true }))
      })
    }

    return streams
  }

  [customInspect] (depth, options) {
    const plugins = this.plugins.map(plugin => plugin.type)
    return `${this.constructor.name} → { url: ${inspect(this.url, options)}, abspath: ${inspect(this.abspath, options)}, plugins: ${inspect(plugins, options)} }`
  }
}

module.exports = {
  Processing
}
