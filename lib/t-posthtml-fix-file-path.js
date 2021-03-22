'use strict'

const { addparam } = require('./url-mapper-utils')

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
            ? addparam(src, 't', 'm')
            : src
        }
      }

      return node
    })
  }
}

module.exports = fixFilePath

function makeRelative (src) {
  if (
    src.startsWith('../') ||
    src.startsWith('./') ||
    src.startsWith('/')
  ) {
    return src
  }

  return './' + src
}
