'use strict'

const { addParam, makeRelative } = require('./url-mapper-utils')

function fixFilePath (abspath, resolve) {
  return tree => {
    tree.walk(node => {
      if (
        node.tag === 'img' &&
        node.attrs?.src != null
      ) {
        const src = resolve(abspath, makeRelative(node.attrs.src))
        if (src != null) node.attrs.src = src
      }

      if (
        node.tag === 'link' &&
        node.attrs?.href != null
      ) {
        const src = resolve(abspath, makeRelative(node.attrs.href))
        if (src != null) node.attrs.href = src
      }

      if (
        node.tag === 'script' &&
        node.attrs?.src != null
      ) {
        const src = resolve(abspath, makeRelative(node.attrs.src))
        if (src != null) {
          node.attrs.src = node.attrs.type === 'module'
            ? addParam(src, 't', 'm')
            : src
        }
      }

      return node
    })
  }
}

module.exports = fixFilePath
