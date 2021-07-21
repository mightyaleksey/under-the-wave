'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

// https://github.com/lukeed/uvu#usage

test('uvu works', () => {
  assert.is(true, true)
  assert.equal({ a: 1, b: new Set([1, 2, 3]) }, { a: 1, b: new Set([1, 2, 3]) })
})

test.run()
