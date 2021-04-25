'use strict'

function updateAssetPathMarkupPlugin (context) {
  return function updateAssetPath (tree) {
    tree.walk(node => {
      // todo check <img srcset='' />, <source srcset='' />
      switch (node.tag) {
        case 'a':
        case 'link': {
          if (node.attrs?.href != null) {
            node.attrs.href = context.resolve(node.attrs.href)
          }
          break
        }

        case 'audio':
        case 'img':
        case 'script':
        case 'source': {
          if (node.attrs?.src != null) {
            node.attrs.src = context.resolve(node.attrs.src)
          }
          break
        }
      }

      return node
    })
  }
}

module.exports = updateAssetPathMarkupPlugin
