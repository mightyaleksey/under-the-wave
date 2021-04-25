/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { abc, hash } = require('../lib/hash-utils')

test('abs', () => {
  expect(abc(0)).toBe('a')
  expect(abc(1)).toBe('b')
  expect(abc(26)).toBe('aa')
})

test('hash', () => {
  expect(hash('/app.js')).toBe('bbtncyf')
  expect(hash('hello world and very long ending to check hash function')).toBe('abpmjmf')
})
