'use strict'

const ctx = Symbol('context')

function inlineProcessEnvScriptPlugin (context) {
  function inlineProcessEnvOnExit (path) {
    if (
      isProcessEnvStatement(path.node) &&
      !path.scope.hasBinding('process')
    ) {
      path.node[ctx] = context.env
    }

    if (Reflect.has(path.node, ctx)) {
      const parent = path.parentPath.node

      if (parent.type === 'MemberExpression') {
        parent[ctx] = path.node[ctx][prop(parent.property)]
      } else {
        const literal = path.node[ctx]

        if (literal === context.env) {
          path.replaceWith({
            type: 'ObjectExpression',
            properties: []
          })
          return
        }

        if (typeof literal === 'string') {
          path.replaceWith({
            type: 'StringLiteral',
            value: literal
          })
          return
        }

        path.replaceWith({
          type: 'NullLiteral'
        })
      }
    }
  }

  return {
    visitor: {
      Program (path) {
        // to avoid plugin order issues,
        // we hit the top node and do additional traverse manually
        // to be sure that subsequent plugins can use changes from this plugin
        // @see https://jamie.build/babel-plugin-ordering.html

        path.traverse({
          MemberExpression: {
            exit: inlineProcessEnvOnExit
          }
        })
      }
    }
  }
}

module.exports = inlineProcessEnvScriptPlugin

function isProcessEnvStatement (node) {
  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'process' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'env'
  )
}

function prop (node) {
  switch (node.type) {
    case 'Identifier': return node.name
    default: return node.value
  }
}
