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

const assert = require('assert')
const t = require('@babel/types')

const { abc } = require('./url-mapper-utils')

const statement = {
  a0: 'a0', // exports
  b0: 'b0', // exports = x
  c0: 'c0', // exports.a
  d0: 'd0', // exports.a = x

  m0: 'm0', // require('..')
  n0: 'n0', // y = require('..')

  bn: 'bn' // exports = require('..')
}

function commonjsModules () {
  const statements = []
  const generatedIDs = new Map()
  const generateID = (s, k) => {
    const key = `${s}:${k}`
    if (!generatedIDs.has(key)) generatedIDs.set(key, `_${abc(generatedIDs.size)}`)
    return generatedIDs.get(key)
  }

  return {
    visitor: {
      AssignmentExpression (path) {
        const left = path.get('left')
        const right = path.get('right')

        let leftStatement = null
        let rightStatement = null

        if (isExportStatement(left)) {
          leftStatement = statement.b0
        } else if (
          path.node.left.type === 'MemberExpression' &&
          isExportStatement(left.get('object'))
        ) {
          leftStatement = statement.d0
        }

        if (isRequireCall(right)) {
          rightStatement = statement.n0
        }

        if (
          leftStatement === statement.b0 &&
          rightStatement === statement.n0
        ) {
          assert(right.node.arguments[0].type === 'StringLiteral')
          const source = right.node.arguments[0].value
          statements.push([statement.bn, null, source])

          path.remove()
          path.skip()
          return
        }

        if (leftStatement != null) {
          const exported = leftStatement === statement.d0 ? left.node.property.name : 'default'
          const id = generateID('ex', exported)
          statements.push([leftStatement, id, exported])

          left.replaceWith(
            t.identifier(id)
          )
          left.skip()
        }

        if (rightStatement != null) {
          const source = right.node.arguments[0].value
          const id = generateID('im', source)
          statements.push([rightStatement, id, source])

          right.replaceWith(
            t.identifier(id)
          )
          right.skip()
        }
      },

      CallExpression (path) {
        if (isRequireCall(path)) {
          assert(path.node.arguments[0].type === 'StringLiteral')
          const source = path.node.arguments[0].value
          const id = generateID('im', source)
          statements.push([statement.m0, id, source])

          path.replaceWith(
            t.identifier(id)
          )
        }
      },

      Identifier (path) {
        if (isExportStatement(path)) {
          const id = generateID('ex', 'default')
          statements.push([statement.a0, id, 'default'])

          path.replaceWith(
            t.identifier(id)
          )
        }
      },

      MemberExpression (path) {
        if (isExportStatement(path)) {
          const id = generateID('ex', 'default')
          statements.push([statement.a0, id, 'default'])

          path.replaceWith(
            t.identifier(id)
          )
        } else if (isExportStatement(path.get('object'))) {
          assert(path.node.property.type === 'Identifier')
          const exported = path.node.property.name
          const id = generateID('ex', exported)
          statements.push([statement.c0, id, exported])

          path.replaceWith(
            t.identifier(id)
          )
        }
      },

      Program: {
        exit (path) {
          const transformDeclarations = []
          const exportDeclarations = []
          const exportSpecifiers = []
          const importDeclarations = []
          const uniqStatements = new Set()
          statements
            .filter(([statementType, id]) => {
              // prob do this check when push it
              if (statementType.endsWith('0')) {
                if (uniqStatements.has(id)) return false
                uniqStatements.add(id)
                return true
              }

              return true
            })
            .forEach(([statementType, id, b]) => {
              switch (statementType) {
                case statement.a0:
                case statement.b0:
                case statement.c0:
                case statement.d0: {
                  exportDeclarations.push(
                    t.variableDeclarator(
                      t.identifier(id)
                    )
                  )
                  exportSpecifiers.push(
                    t.exportSpecifier(
                      t.identifier(id),
                      t.identifier(b)
                    )
                  )

                  break
                }

                case statement.m0:
                case statement.n0: {
                  const importID = generateID('import', b)

                  importDeclarations.push(
                    t.importDeclaration(
                      [
                        t.importNamespaceSpecifier(
                          t.identifier(importID)
                        )
                      ],
                      t.stringLiteral(b)
                    )
                  )
                  transformDeclarations.push(
                    t.variableDeclarator(
                      t.identifier(id),
                      t.logicalExpression(
                        '||',
                        t.memberExpression(
                          t.identifier(importID),
                          t.identifier('default')
                        ),
                        t.identifier(importID)
                      )
                    )
                  )

                  break
                }

                case statement.bn: {
                  const node = t.exportAllDeclaration(
                    t.stringLiteral(b)
                  )

                  path.pushContainer('body', node)
                  break
                }
              }
            })

          if (exportDeclarations.length > 0) {
            path.unshiftContainer('body', t.variableDeclaration('var', exportDeclarations))
          }

          if (transformDeclarations.length > 0) {
            path.unshiftContainer('body', t.variableDeclaration('var', transformDeclarations))
          }

          for (let l = importDeclarations.length; l--;) {
            path.unshiftContainer('body', importDeclarations[l])
          }

          if (exportSpecifiers.length > 0) {
            path.pushContainer('body', t.exportNamedDeclaration(null, exportSpecifiers))
          }
        }
      }
    }
  }
}

module.exports = commonjsModules

function isExportStatement (path) {
  if (
    path.node.type === 'Identifier' &&
    path.node.name === 'exports' &&
    path.scope.bindings.exports == null
  ) return true

  if (
    path.node.type === 'MemberExpression' &&
    path.node.object.type === 'Identifier' &&
    path.node.object.name === 'module' &&
    path.node.property.type === 'Identifier' &&
    path.node.property.name === 'exports' &&
    path.scope.bindings.module == null
  ) return true
}

function isRequireCall (path) {
  return (
    path.node.type === 'CallExpression' &&
    path.node.callee.name === 'require' &&
    path.scope.bindings.require == null
  )
}
