'use strict'

const fs = require('fs')
const path = require('path')
const { Writable } = require('stream')
const { inspect } = require('util')

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

  resolve (url) {
    const dependency = this[factory].resolve(url, this.abspath)

    if (dependency != null) this.dependencies.set(dependency.abspath, dependency)

    return dependency
  }

  requestDependency (url) {
    if (internal.test(url)) throw new Error('requestDependency does not handle internal files')
    if (protocol.test(url)) throw new Error('requestDependency does not support urls')

    const dependency = this.resolve(url) // todo figure out how
    if (dependency == null) return null

    const bufferStream = createBufferStream()
    return dependency.transform(bufferStream)
      .then(() => bufferStream.buffer.toString('utf8'))
  }

  resolveDependency (url) {
    if (internal.test(url)) return url
    if (protocol.test(url)) return url

    const dependency = this.resolve(url)
    if (dependency == null) console.log('can not resolve', url) // todo use logger

    return dependency?.publicUrl(this.abspath) ?? url
  }

  // async transform () {
  //   const streams = [fs.createReadStream(this.abspath)]
  //   const plugins = this.plugins.filter(plugin => plugin.type !== 'identity')

  //   if (plugins.length > 0) {
  //     streams.push(createBufferStream())

  //     plugins.forEach(plugin => {
  //       streams.push(createTransformStream(plugin.transform, this[context], { objectMode: true }))
  //     })
  //   }

  //   return streams
  // }

  async transform (dest) {
    const streams = this._streams()
    streams.push(dest)

    let check = null
    let writing = 0

    let cursor = null
    for (const s of streams) {
      s.on('error', onerror)
      s.on('finish', onfinish)

      if (s instanceof Writable) writing++
      if (cursor == null) cursor = s
      else cursor = cursor.pipe(s)
    }

    return wait()

    function onerror (err) {
      check(err, writing)
    }

    function onfinish () {
      check(null, --writing)
    }

    function cleanup (err) {
      for (let i = 0; i < streams.length; i++) {
        const last = i + 1 === streams.length
        const s = streams[i]
        s.removeListener('error', onerror)
        s.removeListener('finish', onfinish)
        if (err != null && !last) s.destroy()
      }
    }

    function wait () {
      return new Promise((resolve, reject) => {
        check = (err, remaining) => {
          if (err != null) {
            reject(err)
            cleanup(err)
          } else if (remaining === 0) {
            resolve()
            cleanup()
          }
        }
      })
    }
  }

  _streams () {
    const rs = fs.createReadStream(this.abspath)
    const plugins = this.plugins.filter(plugin => plugin.type !== 'identity')

    const streams = [rs]
    if (plugins.length > 0) {
      streams.push(createBufferStream())
      for (const plugin of plugins) {
        streams.push(
          createTransformStream(plugin.transform, this[context], { objectMode: true })
        )
      }
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
