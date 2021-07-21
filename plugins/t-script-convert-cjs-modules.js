'use strict'

// cyclic dependency from a directory,
// as a temp solution is ok, but better to fix
const { abc } = require('../lib/util-hash')
const t = require('./t-script-utils-type')

function convertCjsModulesScriptPlugin () {
  const exportsMap = new Map()
  const importsMap = new Map()
  const interopMap = new Map()
  const generateID = () => `_${abc(exportsMap.size + importsMap.size + interopMap.size)}`
  let all = null
  return {
    visitor: {
      ExpressionStatement: {
        enter (path) {
          const expression = path.node.expression

          if (
            expression.type === 'AssignmentExpression' &&
            isExportsExpresssion(expression.left, path.scope) &&
            isRequireExpression(expression.right, path.scope)
          ) {
            all = expression.right.arguments[0].value
            path.remove()
          }
        }
      },

      MemberExpression: {
        enter (path) {
          if (isExportsExpresssion(path.node, path.scope)) {
            if (!exportsMap.has('default')) exportsMap.set('default', generateID())
            path.replaceWith({
              type: 'Identifier',
              name: exportsMap.get('default')
            })
            return
          }

          if (
            isExportsExpresssion(path.node.object, path.scope) &&
            path.node.property.type === 'Identifier'
          ) {
            const exported = path.node.property.name
            if (!exportsMap.has(exported)) exportsMap.set(exported, generateID())
            path.replaceWith({
              type: 'Identifier',
              name: exportsMap.get(exported)
            })
          }
        }
      },

      Identifier: {
        enter (path) {
          if (isExportsExpresssion(path.node, path.scope)) {
            if (!exportsMap.has('default')) exportsMap.set('default', generateID())
            path.replaceWith({
              type: 'Identifier',
              name: exportsMap.get('default')
            })
          }
        }
      },

      CallExpression: {
        enter (path) {
          if (isRequireExpression(path.node, path.scope)) {
            const source = path.node.arguments[0].value
            if (!importsMap.has(source)) importsMap.set(source, generateID())
            path.replaceWith({
              type: 'Identifier',
              name: importsMap.get(source)
            })
          }
        }
      },

      Program: {
        exit (path) {
          let last = null
          const insert = node => {
            if (last != null) last = last.insertAfter(node)[0]
            else last = path.unshiftContainer('body', node)[0]
          }

          importsMap.forEach((id, source) => {
            interopMap.set(id, generateID())

            const a = {
              type: 'ImportDeclaration',
              specifiers: [
                {
                  type: 'ImportNamespaceSpecifier',
                  local: t.identifier(interopMap.get(id))
                }
              ],
              source: t.string(source)
            }

            insert(a)
          })

          if (interopMap.size > 0) {
            const a = t.variableDeclaration()

            interopMap.forEach((_, id) =>
              a.declarations.push(
                t.variableDeclarator(
                  t.identifier(id),
                  {
                    type: 'LogicalExpression',
                    left: {
                      type: 'MemberExpression',
                      object: t.identifier(_),
                      property: t.identifier('default'),
                      computed: false,
                      optional: false
                    },
                    operator: '||',
                    right: t.identifier(_)
                  }
                )))

            insert(a)
          }

          if (all != null) {
            const a = {
              type: 'ExportAllDeclaration',
              exported: null,
              source: t.string(all)
            }

            path.pushContainer('body', a)
          }

          if (exportsMap.size > 0) {
            const a = t.variableDeclaration()
            const b = {
              type: 'ExportNamedDeclaration',
              declaration: null,
              specifiers: [],
              source: null
            }

            exportsMap.forEach((id, exported) => {
              a.declarations.push(
                t.variableDeclarator(
                  t.identifier(id)
                )
              )
              b.specifiers.push({
                type: 'ExportSpecifier',
                local: t.identifier(id),
                exported: t.identifier(exported)
              })
            })

            insert(a)
            path.pushContainer('body', b)
          }

          exportsMap.clear()
          importsMap.clear()
          interopMap.clear()
        }
      }
    }
  }
}

module.exports = convertCjsModulesScriptPlugin

function isRequireExpression (node, scope) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    !scope.hasBinding('require')
  )
}

function isExportsExpresssion (node, scope) {
  if (
    node.type === 'Identifier' &&
    node.name === 'exports' &&
    !scope.hasBinding('exports')
  ) return true

  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'module' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'exports' &&
    !scope.hasBinding('module')
  )
}
