'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { parse, stringify } = require('../lib/util-yaml')

test('parse', () => {
  const input = `
    a:
      - 1
      - 2
      - 3
    b: c
  `

  const output = {
    a: [1, 2, 3],
    b: 'c'
  }

  assert.equal(parse(input), output)
})

test('stringify', () => {
  const input = {
    a: [1, 2, 3],
    b: 'c'
  }

  const output = [
    'a:',
    '  - 1',
    '  - 2',
    '  - 3',
    'b: c',
    ''
  ].join('\n')

  assert.equal(stringify(input), output)
})

test.run()
