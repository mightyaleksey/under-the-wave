'use strict'

const { pipeline } = require('stream/promises')

const { createBufferStream } = require('./util-stream')

const processing = Symbol('processing')
const protocol = /^[a-z]{2,6}:\/\//i

class Context {
  constructor (processingInstance) {
    this[processing] = processingInstance
  }

  get abspath () {
    return this[processing].abspath
  }

  get env () {
    return this[processing].env
  }

  get settings () {
    return this[processing].settings
  }

  get type () {
    return this[processing].cmd
  }

  async request (url) {
    if (protocol.test(url)) throw new Error('not implemented')

    const childProcessing = this[processing].child(url)
    if (childProcessing == null) return null

    const stream = createBufferStream()
    return pipeline(...await childProcessing.getStreams(), stream)
      .then(() => stream.buffer.toString('utf8'))
  }

  // generate url for a dependency
  resolve (url) {
    if (protocol.test(url)) return url

    const childProcessing = this[processing].child(url, { captureDependency: true })
    if (childProcessing == null) {
      console.log('can not find', url)
      return url
    }

    const publicUrl = childProcessing.publicUrl()
    if (publicUrl == null) {
      console.log('can not build public url for', url)
      return url
    }

    return publicUrl
  }
}

module.exports = {
  Context
}
