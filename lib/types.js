'use strict'

const { InterfaceType } = require('./duck-typing')

const interfaceResolver = new InterfaceType(
  'Resolver',
  ['resolveSync', 'function']
)

const interfaceUrlMapper = new InterfaceType(
  'UrlMapper',
  ['url', 'function']
)

module.exports = {
  interfaceResolver,
  interfaceUrlMapper
}
