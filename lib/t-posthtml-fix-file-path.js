'use strict'

function fixFilePath ({ abspath, resolve }) {
  return tree => {
    tree.walk(node => {
      if (node.tag === 'img' && node.attrs?.src != null) {
        node.attrs.src = resolve(abspath, node.attrs.src)
      }
      if (node.tag === 'link' && node.attrs?.href != null) {
        node.attrs.href = resolve(abspath, node.attrs.href)
      }
      if (node.tag === 'script' && node.attrs?.src != null) {
        node.attrs.src = resolve(abspath, node.attrs.src)
      }

      return node
    })
  }
}

module.exports = fixFilePath
