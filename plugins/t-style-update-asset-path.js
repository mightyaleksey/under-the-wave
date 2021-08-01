'use strict'

// https://developer.mozilla.org/ru/docs/Web/CSS/url()
const protocol = /^[a-z]{2,6}:\/\//i

function isLocalFile (value) {
  if (
    value.startsWith('~/') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../')
  ) return true

  if (
    protocol.test(value) ||
    value.startsWith('data:') ||
    value.startsWith('#')
  ) return false

  return true
}

function trimQuotes (value) {
  return value.replace(/^['"]|["']$/g, '')
}

function updateAssetPathStylePlugin (context) {
  return {
    enter (node) {
      if (node.type === 'Url') {
        const nodeValue = node.value
        const value = nodeValue.type === 'String' ? trimQuotes(nodeValue.value) : nodeValue.value
        if (!isLocalFile(value)) return

        nodeValue.type = 'Raw'
        nodeValue.value = context.resolve(value)
      }
    }
  }
}

module.exports = updateAssetPathStylePlugin
