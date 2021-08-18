'use strict'

const http = require('http')
const net = require('net')

const { ILogger } = require('./util-logger-i')

const startTime = Symbol('startTime')

function createServer (port, logger) {
  // https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback
  if (logger == null) logger = new ILogger()

  const server = http.createServer()
    .on('request', request)
    .on('upgrade', upgrade)
    .listen(port, listen)

  return server

  function request (req, res) {
    res[startTime] = res[startTime] ?? Date.now()

    req.log = res.log = logger.child({ req: req })

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

  function upgrade (req, socket) {
    req.log = logger.child({ req: req })
  }

  function listen () {
    const address = server.address()
    const host = address.family === 'IPv6' ? `[${address.address}]` : address.address
    const url = `http://${host}:${address.port}/`

    logger.info('serving HTTP on %s port %s (%s)', address.address, address.port, url)
  }
}

function findFreePort () {
  return new Promise(resolve => getPort(resolve))

  function getPort (cb) {
    // The Internet Assigned Numbers Authority (IANA) suggests
    // the range 49152 to 65535 for dynamic or private ports.
    const port = Math.floor((65535 - 49152) * Math.random()) + 49152

    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => cb(port))
      server.close()
    })
    server.once('error', () => getPort(cb))
  }
}

module.exports = {
  createServer,
  findFreePort
}
