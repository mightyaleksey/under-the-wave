'use strict'

const assert = require('assert')
const { PassThrough, Transform } = require('stream')

function bufferStream () {
  return new Transform({
    writableObjectMode: true,

    transform (data, encoding, done) {
      done(null, Buffer.from(data))
    }
  })
}

function concatStream () {
  return new Transform({
    readableObjectMode: true,

    construct (done) {
      this.chunks = []
      done()
    },

    transform (chunk, encoding, done) {
      this.chunks.push(chunk)
      done()
    },

    flush (done) {
      const buf = Buffer.concat(this.chunks)
      this.chunks.length = 0

      done(null, buf.toString('utf8'))
    }
  })
}

function transformStream (tf, shared, abspath) {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,

    transform (chunk, encoding, done) {
      tf(chunk, shared, done)
    }
  })
}

function tee (output) {
  assert(output != null)

  const t = new PassThrough()
  t.pipe(output)

  return t
}

module.exports = {
  bufferStream,
  concatStream,
  transformStream,
  tee
}
