'use strict'

const http = require('http')

const startTime = Symbol('startTime')

function createServer (logger, port, host) {
  function onRequest (req, res) {
    res[startTime] = res[startTime] ?? Date.now()

    const log = logger.child({ req: req })
    req.log = res.log = log

    res.on('error', onFinish)
    res.on('finish', onFinish)
  }

  function onFinish (err) {
    const responseTime = Date.now() - this[startTime]

    this.removeListener('error', onFinish)
    this.removeListener('finish', onFinish)

    if (err != null || this.statusCode >= 500) {
      const error = err ?? new Error('failed with status code ' + this.statusCode)
      this.log.info({ err: error, res: this, responseTime: responseTime }, 'request errored')
      return
    }

    this.log.info({ res: this, responseTime: responseTime }, 'request completed')
  }

  const server = http.createServer()
  server.on('request', onRequest)
  server.listen(port, host)

  return server
}

module.exports = {
  createServer
}
