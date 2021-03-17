'use strict'

const assert = require('assert')
const t = require('@babel/types')

function fixModulePath (abspath, resolve) {
  assert(typeof abspath === 'string')
  assert(typeof resolve === 'function')

  return {
    visitor: {
      ImportDeclaration  (path) {
        const source = path.node.source.value
        const url = resolve(abspath, source)
        if (source !== url) {
          path.get('source').replaceWith(t.stringLiteral(url))
        }
      }
    }
  }
}

module.exports = fixModulePath
