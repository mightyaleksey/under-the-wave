/* globals expect,jest,test */
'use strict'

const acorn = require('acorn')

const { serializeNode } = require('./utils')
const { walk } = require('../lib/t-script-utils-walk')
const parse = code => acorn.parse(code, { ecmaVersion: 'latest' })
const mapCalls = (hook, cb) => hook.mock.calls.map(args => cb.apply(null, args))

test('walk branches', () => {
  const ast = parse('a.b')
  const hook = jest.fn()

  walk(ast, {
    enter (node) { hook('enter', node) },
    leave (node) { hook('leave', node) }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[1]',
    'enter -> ExpressionStatement',
    'enter -> MemberExpression',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> MemberExpression',
    'leave -> ExpressionStatement',
    'leave -> Program[1]'
  ])
})

test('walk collections', () => {
  const ast = parse('({ a: null, b: [1, 2, 3], c: undefined })')
  const hook = jest.fn()

  walk(ast, {
    enter (node) { hook('enter', node) },
    leave (node) { hook('leave', node) }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[1]',
    'enter -> ExpressionStatement',
    'enter -> ObjectExpression',
    'enter -> Property',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Literal (null)',
    'leave -> Literal (null)',
    'leave -> Property',
    'enter -> Property',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'enter -> ArrayExpression',
    'enter -> Literal (1)',
    'leave -> Literal (1)',
    'enter -> Literal (2)',
    'leave -> Literal (2)',
    'enter -> Literal (3)',
    'leave -> Literal (3)',
    'leave -> ArrayExpression',
    'leave -> Property',
    'enter -> Property',
    'enter -> Identifier (c)',
    'leave -> Identifier (c)',
    'enter -> Identifier (undefined)',
    'leave -> Identifier (undefined)',
    'leave -> Property',
    'leave -> ObjectExpression',
    'leave -> ExpressionStatement',
    'leave -> Program[1]'
  ])
})

test('walk multiple vertices', () => {
  const ast = parse('[1, 2, 3]; [4, 5]')
  const hook = jest.fn()

  walk(ast, {
    enter (node) { hook('enter', node) },
    leave (node) { hook('leave', node) }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[2]',
    'enter -> ExpressionStatement',
    'enter -> ArrayExpression',
    'enter -> Literal (1)',
    'leave -> Literal (1)',
    'enter -> Literal (2)',
    'leave -> Literal (2)',
    'enter -> Literal (3)',
    'leave -> Literal (3)',
    'leave -> ArrayExpression',
    'leave -> ExpressionStatement',
    'enter -> ExpressionStatement',
    'enter -> ArrayExpression',
    'enter -> Literal (4)',
    'leave -> Literal (4)',
    'enter -> Literal (5)',
    'leave -> Literal (5)',
    'leave -> ArrayExpression',
    'leave -> ExpressionStatement',
    'leave -> Program[2]'
  ])
})

test('call fallback for unknown nodes', () => {
  const ast = { type: 'ArrayExpression', elements: [{ type: 'Unknown' }] }
  const hook = jest.fn()

  walk(ast, {
    enter (node) { hook('enter', node) },
    leave (node) { hook('leave', node) },
    fallback (node) { hook('fallback', node) }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> ArrayExpression',
    'fallback -> Unknown',
    'leave -> ArrayExpression'
  ])
})

test('pass parent node to hooks', () => {
  const ast = parse('[1, 2, 3]; [4, 5]')
  const hook = jest.fn()

  walk(ast, {
    enter (node, parent) { hook('enter', node, parent) },
    leave (node, parent) { hook('leave', node, parent) }
  })

  const calls = mapCalls(hook, (t, node, parent) => `${t} -> ${serializeNode(node)} / ${serializeNode(parent)}`)
  expect(calls).toEqual([
    'enter -> Program[2] / undefined',
    'enter -> ExpressionStatement / Program[2]',
    'enter -> ArrayExpression / ExpressionStatement',
    'enter -> Literal (1) / ArrayExpression',
    'leave -> Literal (1) / ArrayExpression',
    'enter -> Literal (2) / ArrayExpression',
    'leave -> Literal (2) / ArrayExpression',
    'enter -> Literal (3) / ArrayExpression',
    'leave -> Literal (3) / ArrayExpression',
    'leave -> ArrayExpression / ExpressionStatement',
    'leave -> ExpressionStatement / Program[2]',
    'enter -> ExpressionStatement / Program[2]',
    'enter -> ArrayExpression / ExpressionStatement',
    'enter -> Literal (4) / ArrayExpression',
    'leave -> Literal (4) / ArrayExpression',
    'enter -> Literal (5) / ArrayExpression',
    'leave -> Literal (5) / ArrayExpression',
    'leave -> ArrayExpression / ExpressionStatement',
    'leave -> ExpressionStatement / Program[2]',
    'leave -> Program[2] / undefined'
  ])
})

test('pass parent node to fallback', () => {
  const ast = { type: 'ArrayExpression', elements: [{ type: 'Unknown' }] }
  const hook = jest.fn()

  walk(ast, {
    enter (node, parent) { hook('enter', node, parent) },
    leave (node, parent) { hook('leave', node, parent) },
    fallback (node, parent) { hook('fallback', node, parent) }
  })

  const calls = mapCalls(hook, (t, node, parent) => `${t} -> ${serializeNode(node)} / ${serializeNode(parent)}`)
  expect(calls).toEqual([
    'enter -> ArrayExpression / undefined',
    'fallback -> Unknown / ArrayExpression',
    'leave -> ArrayExpression / undefined'
  ])
})

// replace

test('api / replace node from collection via enter hook', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  }

  const hook = jest.fn((t, node) => {
    if (
      t === 'enter' &&
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(ast, {
    enter (node) { return hook('enter', node) },
    leave (node) { return hook('leave', node) }
  })

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'c' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[2]',
    'enter -> Identifier (a)',
    'enter -> Identifier (c)',
    'leave -> Identifier (c)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> Program[2]'
  ])
})

test('api / replace node from collection via leave hook', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  }

  const hook = jest.fn((t, node) => {
    if (
      t === 'leave' &&
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(ast, {
    enter (node) { return hook('enter', node) },
    leave (node) { return hook('leave', node) }
  })

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'c' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[2]',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Identifier (c)',
    'leave -> Identifier (c)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> Program[2]'
  ])
})

test('api / replace node from prop via enter hook', () => {
  const ast = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'a' },
    property: { type: 'Identifier', name: 'b' }
  }

  const hook = jest.fn((t, node) => {
    if (
      t === 'enter' &&
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(ast, {
    enter (node) { return hook('enter', node) },
    leave (node) { return hook('leave', node) }
  })

  expect(ast).toEqual({
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'c' },
    property: { type: 'Identifier', name: 'b' }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> MemberExpression',
    'enter -> Identifier (a)',
    'enter -> Identifier (c)',
    'leave -> Identifier (c)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> MemberExpression'
  ])
})

test('api / replace node from prop via leave hook', () => {
  const ast = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'a' },
    property: { type: 'Identifier', name: 'b' }
  }

  const hook = jest.fn((t, node) => {
    if (
      t === 'leave' &&
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(ast, {
    enter (node) { return hook('enter', node) },
    leave (node) { return hook('leave', node) }
  })

  expect(ast).toEqual({
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'c' },
    property: { type: 'Identifier', name: 'b' }
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> MemberExpression',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Identifier (c)',
    'leave -> Identifier (c)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> MemberExpression'
  ])
})

// remove

test('api / remove node from collection via enter hook', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      // extra pair to check that we switch between branches properly
      { type: 'Identifier', name: 'a' }
    ]
  }

  const enter = jest.fn(node => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return null
  })
  const leave = jest.fn()

  walk(ast, { enter, leave })

  expect(ast).toEqual({
    type: 'Program',
    body: []
  })
})

test('api / remove node from collection via leave hook', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      // extra pair to check that we switch between branches properly
      { type: 'Identifier', name: 'a' }
    ]
  }

  const enter = jest.fn()
  const leave = jest.fn(node => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return null
  })

  walk(ast, { enter, leave })

  expect(ast).toEqual({
    type: 'Program',
    body: []
  })
})

// insert

test('api / insert node into collection via enter hook', () => {
  const ast = {
    type: 'Program',
    body: []
  }

  const hook = jest.fn()

  walk(ast, {
    enter (node) {
      hook('enter', node)
      if (node.type === 'Program') {
        this.insert(node.body, 0, { type: 'Identifier', name: 'a' })
        this.insert(node.body, 1, { type: 'Identifier', name: 'b' })
      }
    },
    leave (node) {
      hook('leave', node)
    }
  })

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[2]',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)',
    'leave -> Program[2]'
  ])
})

test('api / insert node into collection via leave hook', () => {
  const ast = {
    type: 'Program',
    body: []
  }

  const hook = jest.fn()

  walk(ast, {
    enter (node) {
      hook('enter', node)
    },
    leave (node) {
      hook('leave', node)
      if (node.type === 'Program') {
        this.insert(node.body, 0, { type: 'Identifier', name: 'a' })
        this.insert(node.body, 1, { type: 'Identifier', name: 'b' })
      }
    }
  })

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  const calls = mapCalls(hook, (t, node) => `${t} -> ${serializeNode(node)}`)
  expect(calls).toEqual([
    'enter -> Program[2]',
    'leave -> Program[2]',
    'enter -> Identifier (a)',
    'leave -> Identifier (a)',
    'enter -> Identifier (b)',
    'leave -> Identifier (b)'
  ])
})
