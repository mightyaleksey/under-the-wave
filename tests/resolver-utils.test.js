/* globals expect,jest,test */
'use strict'

const assert = require('assert')
const path = require('path')

const { ListItem } = require('../lib/data-structures')
const { nodeModulesPaths, requireResolveSync } = require('../lib/resolver-utils')

const fileExts = ListItem.from('', '.js', '.json')

function requireResolve (to, from) {
  const cache = {}
  const abspath = requireResolveSync(to, from, fileExts, cache)
  assert(abspath != null, `requireResolve: failed to resolve "${to}"`)
  return path.relative(__dirname, abspath)
}

test('nodeModulesPaths returns list of node_modules folders', () => {
  const cache = {}
  const dirs = nodeModulesPaths(__dirname, cache)
  // picking only first two that are in the project's scope.
  const nodeModules = [...dirs].slice(0, 2).map(abspath => path.relative(__dirname, abspath))
  expect(nodeModules).toEqual(['node_modules', '../node_modules'])
})

test('nodeModulesPaths should use cache on the next iteration', () => {
  jest.resetModules()

  const futils = require('../lib/fs-utils')
  const spy = jest.spyOn(futils, 'isdirsync')

  const { nodeModulesPaths: nodeModules } = jest.requireActual('../lib/resolver-utils')

  const cache = {}

  nodeModules(__dirname, cache)
  expect(cache).toHaveProperty(__dirname)
  expect(futils.isdirsync).toHaveBeenCalled()

  futils.isdirsync.mockReset()
  nodeModules(__dirname, cache)
  expect(futils.isdirsync).not.toHaveBeenCalled()

  spy.mockRestore()
})

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
