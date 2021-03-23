'use strict'

const { makeRelative } = require('./url-mapper-utils')

function fixFilePath (abspath, resolve) {
  return node => {
    if (node.type === 'Url') {
      switch (node.value.type) {
        case 'Raw': {
          const value = node.value.value
          const src = resolve(abspath, makeRelative(value))
          if (src != null) node.value.value = src
          break
        }

        case 'String': {
          const value = node.value.value.replace(/^['"]|['"]$/g, '')
          const src = resolve(abspath, makeRelative(value))
          if (src != null) node.value.value = JSON.stringify(src)
          break
        }
      }
    }
  }
}

module.exports = fixFilePath
