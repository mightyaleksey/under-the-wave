'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { createEnv, createTestEnv } = require('../lib/util-env')

test('createEnv', () => {
  const env = createEnv()

  assert.ok(env != null)
  assert.type(env.TERM_PROGRAM, 'string')
})

test('createTestEnv', () => {
  assert.equal(createTestEnv(), { NODE_ENV: 'test' })
  assert.equal(createTestEnv({ a: 'foo' }), { NODE_ENV: 'test', a: 'foo' })
})

test('createTestEnv validates input', () => {
  assert.throws(
    () => createTestEnv({ a: 1 }),
    /Only string values can be used for environment variables/
  )
})

test.run()
