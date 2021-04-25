'use strict'

function updateModulePathScriptPlugin (context) {
  function updateModulePathsOnEnter (path) {
    const origin = path.node.source.value
    const url = context.resolve(origin)
    if (origin !== url) {
      path.node.source.value = url
    }
  }

  return {
    visitor: {
      ExportAllDeclaration: {
        enter: updateModulePathsOnEnter
      },

      ImportDeclaration: {
        enter: updateModulePathsOnEnter
      }
    }
  }
}

module.exports = updateModulePathScriptPlugin
