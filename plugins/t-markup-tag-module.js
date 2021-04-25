'use strict'

function tagModuleMarkupPlugin () {
  return function tagModule (tree) {
    tree.walk(node => {
      if (
        node.tag === 'script' &&
        node.attrs.type === 'module' &&
        node.attrs.src != null
      ) {
        node.attrs.src = node.attrs.src + '?t=m'
      }

      return node
    })
  }
}

module.exports = tagModuleMarkupPlugin
