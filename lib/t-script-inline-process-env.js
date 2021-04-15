'use strict'

const t = require('./t-script-utils-type')

const ctx = Symbol('context')

function inlineProcessEnvScriptPlugin (env) {
  return {
    leave (node, parent, scope) {
      if (isProcessEnvStatement(node, scope)) {
        node[ctx] = env
      }

      if (Reflect.has(node, ctx)) {
        if (parent.type === 'MemberExpression') {
          parent[ctx] = node[ctx][prop(parent.property)]
        } else {
          const literal = node[ctx]
          if (literal === env) return { type: 'ObjectExpression', properties: [] }
          if (typeof literal === 'string') return t.literal(literal)
          return t.literal(null)
        }
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
