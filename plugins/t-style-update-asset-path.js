'use strict'

function updateAssetPathStylePlugin (context) {
  return {
    enter (node) {
      if (node.type === 'Url') {
        const urlValue = node.value
        if (urlValue.type === 'Raw') {
          urlValue.value = context.resolve(node.value.value)
        }

        if (urlValue.type === 'String') {
          const raw = node.value.value.replace(/^['"]|["']$/g, '')
          urlValue.value =  context.resolve(raw)
        }
      }
    }
  }
}

module.exports = updateAssetPathStylePlugin
