'use strict'

const bridgeUrl = '/-internal-/bridge.js'
const indent = /^[\n\s]+$/

const scriptNode = {
  tag: 'script',
  attrs: {
    type: 'module',
    src: bridgeUrl,
    async: true
  }
}

function hasBridgeScript (node) {
  return (
    node.content != null &&
    node.content.some(node => node.tag === 'script' && node.attrs.src === bridgeUrl)
  )
}

function injectBridgeMarkupPlugin () {
  return function injectBridge (tree) {
    tree.walk(node => {
      if (node.tag === 'head' && !hasBridgeScript(node)) {
        if (node.content != null) {
          const first = node.content[0]
          const last = node.content[node.content.length - 1]

          if (indent.test(first) && indent.test(last)) {
            node.content.splice(node.content.length - 1, 0, first, scriptNode)
          } else {
            node.content.push(scriptNode)
          }
        } else {
          node.content = [scriptNode]
        }
      }

      return node
    })
  }
}

module.exports = injectBridgeMarkupPlugin
