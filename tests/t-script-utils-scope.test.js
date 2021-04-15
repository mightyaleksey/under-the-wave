/* globals expect,jest,test */
'use strict'

const { serializeNode, serializeScope, transformScript } = require('./utils')
const mapResults = (hook, cb) => hook.mock.results.map(a => cb(a.value))
const defaultHook = (t, node, parent, scope) => `${t} -> ${serializeNode(node)} ${serializeScope(scope)}`

test('handle variable declaration', () => {
  const code = `
    var a = 1, b = 1
    var c = 1
  `

  const hook = jest.fn(defaultHook)
  transformScript(code, {
    enter (node, parent, scope) { },
    leave (node, parent, scope) {
      if (
        [
          'VariableDeclaration',
          'VariableDeclarator'
        ].includes(node.type)
      ) hook('leave', node, parent, scope)
    }
  })

  const results = mapResults(hook, a => a)
  expect(results).toEqual([
    'leave -> VariableDeclarator { }',
    'leave -> VariableDeclarator { a }',
    'leave -> VariableDeclaration { a, b }',
    'leave -> VariableDeclarator { a, b }',
    'leave -> VariableDeclaration { a, b, c }'
  ])
})

test('assign var to a proper scope', () => {
  const code = `
    const a = 1
    var b = 1

    {
      const aa = 1
      var bb = 1
    }
  `

  const hook = jest.fn(defaultHook)
  transformScript(code, {
    enter (node, parent, scope) {
      if (
        [
          'BlockStatement'
        ].includes(node.type)
      ) hook('enter', node, parent, scope)
    },
    leave (node, parent, scope) {
      if (
        [
          'BlockStatement',
          'Program',
          'VariableDeclaration',
          'VariableDeclarator'
        ].includes(node.type)
      ) hook('leave', node, parent, scope)
    }
  })

  const results = mapResults(hook, a => a)
  expect(results).toEqual([
    'leave -> VariableDeclarator { }',
    'leave -> VariableDeclaration { a }',
    'leave -> VariableDeclarator { a }',
    'leave -> VariableDeclaration { a, b }',
    'enter -> BlockStatement { a, b }',
    'leave -> VariableDeclarator { < a, b }',
    'leave -> VariableDeclaration { aa < a, b }',
    'leave -> VariableDeclarator { aa < a, b }',
    'leave -> VariableDeclaration { aa < a, b, bb }',
    'leave -> BlockStatement { aa < a, b, bb }',
    'leave -> Program[3] { a, b, bb }'
  ])
})
