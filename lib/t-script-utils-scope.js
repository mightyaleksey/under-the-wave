'use strict'

const scope = Symbol('scope')
const type = Symbol('type')

const scopeType = {
  BlockStatement: 'block',
  ForStatement: 'for',
  FunctionDeclaration: 'function',
  FunctionExpression: 'function',
  Program: 'global'
}

function scopePlugin () {
  return {
    enter (node, parent, localScope) {
      switch (node.type) {
        case 'BlockStatement':
          switch (parent.type) {
            case 'ForStatement':
            case 'FunctionDeclaration':
            case 'FunctionExpression':
              return localScope
          }
          return (node[scope] = createScope(localScope, scopeType[node.type]))
        case 'ForStatement':
          if (node.body.type !== 'BlockStatement') return localScope
          return (node[scope] = createScope(localScope, scopeType[node.type]))
        case 'FunctionDeclaration':
        case 'FunctionExpression':
          return (node[scope] = createScope(localScope, scopeType[node.type]))
        case 'Program':
          return (node[scope] = createScope(null, scopeType[node.type]))

        default:
          return localScope
      }
    },
    leave (node, parent, localScope) {
      switch (node.type) {
        case 'VariableDeclarator':
          if (parent.kind === 'var' && localScope[type] === 'block') {
            let scope = localScope
            while (scope[type] === 'block') scope = Object.getPrototypeOf(scope)
            scope[node.id.name] = true
            return localScope
          }
          localScope[node.id.name] = true
          return localScope

        case 'Program':
          return localScope

        default:
          if (node[scope] != null) return Object.getPrototypeOf(localScope)
          return localScope
      }
    }
  }
}

module.exports = scopePlugin

function createScope (parentScope, scopeType) {
  return Object.create(parentScope, {
    [type]: {
      value: scopeType,
      configurable: false,
      enumerable: false,
      writable: false
    }
  })
}
