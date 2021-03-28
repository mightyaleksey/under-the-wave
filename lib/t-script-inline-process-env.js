'use strict'

const ctx = Symbol('context')

function inlineProcessEnvScriptPlugin (env) {
  return {
    enter (node, ancestors, scope) {
      if (isProcessEnvStatement(node, scope)) {
        let i = ancestors.length - 1
        let context = env
        while (i > 0 && ancestors[i - 1].type === 'MemberExpression') {
          i--
          context = context != null
            ? context[prop(ancestors[i].property)]
            : context
        }

        ancestors[i][ctx] = context
      }
    },

    leave (node) {
      if (Reflect.has(node, ctx)) {
        const context = node[ctx]

        if (context === env) return { type: 'ObjectExpression', properties: [] }
        if (typeof context === 'string') return { type: 'Literal', value: context }
        return { type: 'Literal', value: null }
      }
    }
  }
}

module.exports = inlineProcessEnvScriptPlugin

function isProcessEnvStatement (node, scope) {
  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'process' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'env' &&
    scope.process !== true
  )
}

function prop (node) {
  switch (node.type) {
    case 'Identifier': return node.name
    case 'Literal': return node.value
  }
}
