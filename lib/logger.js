'use strict'

const pino = require('pino')
const pinoColada = require('pino-colada')

function createLogger (opts, stream) {
  const options = {
    prettyPrint: opts?.pretty === true ? {} : false,
    prettifier: pinoColada,
    serializers: {
      err: errSerializer,
      req: reqSerializer,
      res: resSerializer
    }
  }

  return pino(options, stream)
}

module.exports = {
  createLogger
}

function errSerializer (err) {
  return {
    type: err.name,
    message: err.message,
    stack: err.stack
  }
}

function reqSerializer (req) {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers
  }
}

function resSerializer (res) {
  return {
    statusCode: res.statusCode,
    headers: res.getHeaders()
  }
}
