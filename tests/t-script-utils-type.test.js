/* globals expect,test */
'use strict'

const escodegen = require('escodegen')

const t = require('../lib/t-script-utils-type')
const g = a => escodegen.generate(a)

test('identifier', () => {
  expect(g(t.identifier('a'))).toBe('a')
})

test('literal', () => {
  expect(g(t.literal('a'))).toBe('\'a\'')
  expect(g(t.literal(1))).toBe('1')
  expect(g(t.literal(null))).toBe('null')
})

test('variableDeclaration', () => {
  const a = t.variableDeclaration([
    t.variableDeclarator(
      t.identifier('a'),
      t.literal(1)
    )
  ])

  expect(g(a)).toBe('var a = 1;')
})
