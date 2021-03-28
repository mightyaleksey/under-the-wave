'use strict'

const http = require('http')

const startTime = Symbol('startTime')

function createServer (logger, port) {
  const server = http
    .createServer()
    .on('request', request)
    .listen(port)

  return server

  function request (req, res) {
    res[startTime] = res[startTime] ?? Date.now()

    const log = logger.child({ req: req })
    req.log = res.log = log

    res.on('error', finish)
    res.on('finish', finish)
  }

  function finish (err) {
    // this = response
    const responseTime = Date.now() - this[startTime]

    this.removeListener('error', finish)
    this.removeListener('finish', finish)

    if (err != null || this.statusCode >= 500) {
      const error = err ?? this.err ?? new Error('failed with status code ' + this.statusCode)
      this.log.error({ err: error, res: this, responseTime: responseTime }, 'request errored')
      return
    }

    this.log.info({ res: this, responseTime: responseTime }, 'request completed')
  }
}

module.exports = {
  createServer
}
