'use strict'

/**
 * Results of require call:
 * 1. module has module.exports - identifier overwrites exports map, as a result identifier is returned.
 * 2. module has exports.a and etc. - exports map is returned.
 *
 * Case 2 is easily transformed through the import namespace.
 * However, 1 is tricky and can not be transformed.
 *
 * For case 1 use export default and replace require with conditional statement:
 * - require('..').default || require('..')
 */

const { abc } = require('./utils')
const t = require('./t-script-utils-type')

function convertCjsModulesScriptPlugin (abspath, resolve) {
  const exportsMap = new Map()
  const importsMap = new Map()
  const interopMap = new Map()
  const generateID = () => `_${abc(exportsMap.size + importsMap.size + interopMap.size)}`
  let all = null
  return {
    enter (node, ancestors, scope) {
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'AssignmentExpression' &&
        isExportsExpresssion(node.expression.left, scope) &&
        isRequireCallExpression(node.expression.right, scope)
      ) {
        all = node.expression.right.arguments[0].value
        return null
      }

      if (isRequireCallExpression(node, scope)) {
        const source = node.arguments[0].value
        if (!importsMap.has(source)) importsMap.set(source, generateID())
        return t.identifier(importsMap.get(source))
      }

      if (isExportsExpresssion(node, scope)) {
        if (!exportsMap.has('default')) exportsMap.set('default', generateID())
        return t.identifier(exportsMap.get('default'))
      }

      if (
        node.type === 'MemberExpression' &&
        isExportsExpresssion(node.object, scope) &&
        node.property.type === 'Identifier'
      ) {
        const exported = node.property.name
        if (!exportsMap.has(exported)) exportsMap.set(exported, generateID())
        return t.identifier(exportsMap.get(exported))
      }
    },

    leave (node) {
      if (node.type === 'Program') {
        let start =
          node.body.length > 0 &&
          node.body[0].type === 'ExpressionStatement' &&
          node.body[0].directive === 'use strict'
            ? 1
            : 0

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
            source: t.literal(source)
          }

          this.insert(node.body, start++, a)
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

          this.insert(node.body, start++, a)
        }

        if (all != null) {
          const a = {
            type: 'ExportAllDeclaration',
            exported: null,
            source: t.literal(all)
          }

          this.append(node.body, a)
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

          this.insert(node.body, start++, a)
          this.append(node.body, b)
        }

        exportsMap.clear()
        importsMap.clear()
        interopMap.clear()
      }
    }
  }
}

module.exports = convertCjsModulesScriptPlugin

function isExportsExpresssion (node, scope) {
  if (
    node.type === 'Identifier' &&
    node.name === 'exports' &&
    scope.exports !== true
  ) return true

  if (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'module' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'exports' &&
    scope.module !== true
  ) return true

  return false
}

function isRequireCallExpression (node, scope) {
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    scope.require !== true
  ) return true

  return false
}
