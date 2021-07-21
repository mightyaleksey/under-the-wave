'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { abc, hash } = require('../lib/util-hash')

test('abc', () => {
  assert.is(abc(), 'a')
  assert.is(abc(null), 'a')
  assert.is(abc(0), 'a')
  assert.is(abc(1), 'b')
  assert.is(abc(26), 'aa')
})

test('hash', () => {
  assert.is(hash('/app.js'), 'bbtncyf')
  assert.is(hash('hello world and very long ending to check hash function'), 'abpmjmf')
})

test.run()
