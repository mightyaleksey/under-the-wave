'use strict'

function tagModuleScriptPlugin () {
  return {
    enter (node) {
      if (isModuleDeclaration(node)) {
        node.source.value += '?t=m'
      }
    }
  }
}

module.exports = tagModuleScriptPlugin

function isModuleDeclaration (node) {
  return (
    node.type === 'ExportAllDeclaration' ||
    node.type === 'ImportDeclaration'
  )
}
