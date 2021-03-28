'use strict'

function updateModulePathScriptPlugin (abspath, resolve) {
  return {
    enter (node) {
      if (isModuleDeclaration(node)) {
        const origin = node.source.value
        const url = resolve(abspath, origin)
        if (origin !== url) {
          // update raw?
          node.source.value = url
        }
      }
    }
  }
}

module.exports = updateModulePathScriptPlugin

function isModuleDeclaration (node) {
  return (
    node.type === 'ExportAllDeclaration' ||
    node.type === 'ImportDeclaration'
  )
}
