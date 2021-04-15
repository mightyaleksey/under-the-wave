'use strict'

function injectBridgeMarkupPlugin (tree) {
  tree.walk(node => {
    if (node.tag === 'head') {
      node.content.push({
        tag: 'script',
        attrs: { type: 'module', src: '/~/bridge/', async: true }

      })
    }

    return node
  })
}

module.exports = injectBridgeMarkupPlugin
