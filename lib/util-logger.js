'use strict'

const pino = require('pino')
const pinoColada = require('pino-colada')

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

/**
 * @implements {ILogger}
 */
class Logger {
  constructor (options, stream) {
    const opts = {
      level: options?.level != null ? options.level : 'info',
      prettyPrint: options?.pretty === true ? {} : false,
      prettifier: pinoColada,
      serializers: {
        err: errSerializer,
        req: reqSerializer,
        res: resSerializer
      }
    }

    return pino(opts, stream)
  }
}

module.exports = {
  Logger
}
