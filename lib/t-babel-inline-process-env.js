'use strict'

const t = require('@babel/types')

function propValue (node) {
  switch (node.property.type) {
    case 'Identifier':
      return node.property.name
    case 'NumericLiteral':
      return node.property.value
  }
}

function serialize (value, isEnvItself) {
  if (isEnvItself) {
    return t.objectExpression([])
  }

  if (typeof value === 'string') {
    return t.stringLiteral(value)
  }

  return t.nullLiteral()
}

function inlineProcessEnv ({ env }) {
  return {
    visitor: {
      Program (programPath) {
        // to avoid plugin order issues,
        // we hit the top node and do additional traverse manually
        // to be sure that subsequent plugins can use changes from this plugin
        // @see https://jamie.build/babel-plugin-ordering.html

        // probably not that necessary and hide this feature under the flag
        programPath.traverse({
          MemberExpression (path) {
            if (isProcessEnvStatement(path)) {
              let currentPath = path
              let localContext = env
              while (currentPath.parentPath.node.type === 'MemberExpression') {
                if (currentPath.key !== 'object') return
                currentPath = currentPath.parentPath
                localContext = (localContext ?? {})[propValue(currentPath.node)]
              }

              const isEnvItself = path.parentPath.node.type !== 'MemberExpression'
              const node = serialize(localContext, isEnvItself)
              currentPath.replaceWith(node)
            }
          }
        })
      }
    }
  }
}

module.exports = inlineProcessEnv

function isProcessEnvStatement (path) {
  return (
    path.node.object.type === 'Identifier' &&
    path.node.object.name === 'process' &&
    path.node.property.type === 'Identifier' &&
    path.node.property.name === 'env' &&
    path.scope.bindings.process == null
  )
}
