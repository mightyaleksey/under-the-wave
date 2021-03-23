'use strict'

const assert = require('assert')
const t = require('@babel/types')

const { addParam } = require('./url-mapper-utils')

function fixModulePath (abspath, resolve) {
  assert(typeof abspath === 'string')
  assert(typeof resolve === 'function')

  return {
    visitor: {
      ExportAllDeclaration (path) {
        const source = path.node.source.value
        const url = resolve(abspath, source)
        if (source !== url) {
          path.get('source').replaceWith(t.stringLiteral(addParam(url, 't', 'm')))
        }
      },

      ImportDeclaration  (path) {
        const source = path.node.source.value
        const url = resolve(abspath, source)
        if (source !== url) {
          path.get('source').replaceWith(t.stringLiteral(addParam(url, 't', 'm')))
        }
      }
    }
  }
}

module.exports = fixModulePath
