'use strict'

function createLogger () {
  return require('pino')({
    prettyPrint: {},
    prettifier: require('pino-colada')
  })
}

function createHttpLogger () {
  return require('pino-http')({
    prettyPrint: {},
    prettifier: require('pino-colada')
  })
}

module.exports = { createLogger, createHttpLogger }
