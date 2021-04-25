/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { parse, stringify } = require('../lib/yaml')

test('parse', () => {
  const input = `
a:
  - 1
  - 2
  - 3
b: c
`

  expect(parse(input)).toEqual({
    a: [1, 2, 3],
    b: 'c'
  })
})

test('stringify', () => {
  const output = `
a:
  - 1
  - 2
  - 3
b: c
`

  expect(stringify({
    a: [1, 2, 3],
    b: 'c'
  })).toBe(output.trimStart())
})
