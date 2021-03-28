/* globals expect,jest,test */
'use strict'

const acorn = require('acorn')

const { walk } = require('../lib/t-script-utils-walk')

const s = (node) => {
  const v = node.name ?? node.value ?? null
  return v != null ? `${node.type} {${v}}` : `${node.type}`
}

test('walk tree in order with single branch', () => {
  const ast = acorn.parse('[1, 2, 3]', { ecmaVersion: 'latest' })
  const hook = jest.fn((type, node) => `${type} ${s(node)}`)

  walk(
    ast,
    [{
      enter: (node, ancestors) => hook('enter', node, ancestors),
      leave: (node, ancestors) => hook('leave', node, ancestors)
    }]
  )

  expect(hook.mock.results.map(a => a.value)).toEqual([
    'enter Program',
    'enter ExpressionStatement',
    'enter ArrayExpression',
    'enter Literal {1}',
    'leave Literal {1}',
    'enter Literal {2}',
    'leave Literal {2}',
    'enter Literal {3}',
    'leave Literal {3}',
    'leave ArrayExpression',
    'leave ExpressionStatement',
    'leave Program'
  ])
})

test('walk tree in order with multiple branches', () => {
  const ast = acorn.parse('[1, 2, 3]; [4, 5]', { ecmaVersion: 'latest' })
  const hook = jest.fn((type, node) => `${type} ${s(node)}`)

  walk(
    ast,
    [{
      enter: (node, ancestors) => hook('enter', node, ancestors),
      leave: (node, ancestors) => hook('leave', node, ancestors)
    }]
  )

  expect(hook.mock.results.map(a => a.value)).toEqual([
    'enter Program',
    'enter ExpressionStatement',
    'enter ArrayExpression',
    'enter Literal {1}',
    'leave Literal {1}',
    'enter Literal {2}',
    'leave Literal {2}',
    'enter Literal {3}',
    'leave Literal {3}',
    'leave ArrayExpression',
    'leave ExpressionStatement',
    'enter ExpressionStatement',
    'enter ArrayExpression',
    'enter Literal {4}',
    'leave Literal {4}',
    'enter Literal {5}',
    'leave Literal {5}',
    'leave ArrayExpression',
    'leave ExpressionStatement',
    'leave Program'
  ])
})

test('call fallback for unknown nodes', () => {
  const ast = {
    type: 'ArrayExpression',
    elements: [{ type: 'Unknown' }]
  }
  const calls = []

  walk(
    ast,
    [{
      enter (node) { calls.push('enter ' + node.type) },
      leave (node) { calls.push('leave ' + node.type) },
      fallback (node) { calls.push('fallback ' + node.type) }
    }]
  )

  expect(calls).toEqual([
    'enter ArrayExpression',
    'fallback Unknown',
    'leave ArrayExpression'
  ])
})

test('replace node from enter hook', () => {
  const ast = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'a' },
    property: { type: 'Identifier', name: 'b' }
  }

  const enter = jest.fn(node => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(
    ast,
    [{ enter: enter }]
  )

  expect(ast).toEqual({
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'c' }, // replaced
    property: { type: 'Identifier', name: 'b' }
  })

  expect(enter).toHaveBeenCalledWith(
    { type: 'Identifier', name: 'c' }, [], {}
  )
})

test('replace node from enter hook inside array', () => {
  const ast = {
    type: 'Program',
    body: [{ type: 'Identifier', name: 'a' }]
  }

  const enter = jest.fn(node => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(
    ast,
    [{ enter: enter }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: [{ type: 'Identifier', name: 'c' }]
  })

  expect(enter).toHaveBeenCalledWith(
    { type: 'Identifier', name: 'c' }, [], {}
  )
})

test('replace node from leave hook', () => {
  const ast = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'a' },
    property: { type: 'Identifier', name: 'b' }
  }

  const leave = jest.fn((node) => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(
    ast,
    [{ leave: leave }]
  )

  expect(ast).toEqual({
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'c' }, // replaced
    property: { type: 'Identifier', name: 'b' }
  })

  expect(leave).toHaveBeenCalledWith(
    { type: 'Identifier', name: 'c' }, [], {}
  )
})

test('replace node from leave hook inside array', () => {
  const ast = {
    type: 'Program',
    body: [{ type: 'Identifier', name: 'a' }]
  }

  const leave = jest.fn((node) => {
    if (
      node.type === 'Identifier' &&
      node.name === 'a'
    ) return { type: 'Identifier', name: 'c' }
  })

  walk(
    ast,
    [{ leave: leave }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: [{ type: 'Identifier', name: 'c' }]
  })

  expect(leave).toHaveBeenCalledWith(
    { type: 'Identifier', name: 'c' }, [], {}
  )
})

test('remove node from enter hook inside array', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      // extra pair to check that we switch between branches properly
      { type: 'Identifier', name: 'a' }
    ]
  }

  walk(
    ast,
    [{
      enter (node) {
        if (
          node.type === 'Identifier' &&
          node.name === 'a'
        ) return null
      }
    }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: []
  })
})

test('remove node from leave hook inside array', () => {
  const ast = {
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      // extra pair to check that we switch between branches properly
      { type: 'Identifier', name: 'a' }
    ]
  }

  walk(
    ast,
    [{
      leave (node) {
        if (
          node.type === 'Identifier' &&
          node.name === 'a'
        ) return null
      }
    }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: []
  })
})

test('insert node from enter hook', () => {
  const ast = {
    type: 'Program',
    body: []
  }

  const enter = jest.fn(function (node) {
    if (node.type === 'Program') {
      this.insert(node.body, 0, { type: 'Identifier', name: 'a' })
      // extra pair to check that we walk all new nodes
      this.insert(node.body, 1, { type: 'Identifier', name: 'b' })
    }
  })

  walk(
    ast,
    [{ enter }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  expect(enter.mock.calls.map(a => s(a[0]))).toEqual([
    'Program',
    'Identifier {a}',
    'Identifier {b}'
  ])
})

test('insert node from leave hook', () => {
  const ast = {
    type: 'Program',
    body: []
  }

  const enter = jest.fn()
  const leave = jest.fn(function (node) {
    if (node.type === 'Program') {
      this.insert(node.body, 0, { type: 'Identifier', name: 'a' })
      // extra pair to check that we walk all new nodes
      this.insert(node.body, 1, { type: 'Identifier', name: 'b' })
    }
  })

  walk(
    ast,
    [{ enter, leave }]
  )

  expect(ast).toEqual({
    type: 'Program',
    body: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' }
    ]
  })

  expect(enter.mock.calls.map(a => s(a[0]))).toEqual([
    'Program',
    'Identifier {a}',
    'Identifier {b}'
  ])
  expect(leave.mock.calls.map(a => s(a[0]))).toEqual([
    'Program',
    'Identifier {a}',
    'Identifier {b}'
  ])
})
