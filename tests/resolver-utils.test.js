/* globals expect,test */
'use strict'

const assert = require('assert')
const path = require('path')

const { requireResolveSync } = require('../lib/resolver-utils')

function requireResolve (to, from) {
  const abspath = requireResolveSync(to, from)
  assert(abspath != null, `requireResolve: failed to resolve "${to}"`)
  return path.relative(__dirname, abspath)
}

test('resolve file', () => {
  expect(requireResolve('./node_modules/a/a.js', __filename)).toBe('node_modules/a/a.js')
  expect(requireResolve('./node_modules/a/a', __filename)).toBe('node_modules/a/a.js')
})

test('resolve file from node_modules', () => {
  expect(requireResolve('a/a.js', __filename)).toBe('node_modules/a/a.js')
  expect(requireResolve('a/a', __filename)).toBe('node_modules/a/a.js')
})

test('require resolve directory via index from node_modules', () => {
  expect(requireResolve('a/lib', __filename)).toBe('node_modules/a/lib/index.js')
})

test('require resolve directory via package main from node_modules', () => {
  expect(requireResolve('a', __filename)).toBe('node_modules/a/a.js')
})
