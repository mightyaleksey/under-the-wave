'use strict'

const indent = /^[\n\s]+$/

function injectBridgeMarkupPlugin () {
  return function injectBridge (tree) {
    tree.walk(node => {
      if (node.tag === 'head') {
        const first = node.content[0]
        const last = node.content[node.content.length - 1]

        const script = {
          tag: 'script',
          attrs: {
            type: 'module',
            src: '/~/bridge/',
            async: true
          }
        }

        if (indent.test(first) && indent.test(last)) {
          node.content.splice(node.content.length - 1, 0, first, script)
        } else {
          node.content.push(script)
        }
      }

      return node
    })
  }
}

module.exports = injectBridgeMarkupPlugin
