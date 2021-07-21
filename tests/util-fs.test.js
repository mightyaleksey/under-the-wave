'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { isDirectorySync, isFile, isFileSync } = require('../lib/util-fs')

test('isDirectorySync', async () => {
  assert.ok(await isDirectorySync(__dirname))
  assert.not.ok(await isDirectorySync(__filename))
  assert.not.ok(await isDirectorySync('a'))
})

test('isFile', async () => {
  assert.ok(await isFile(__filename))
  assert.not.ok(await isFile(__dirname))
  assert.not.ok(await isFile('a'))
})

test('isFileSync', () => {
  assert.ok(isFileSync(__filename))
  assert.not.ok(isFileSync(__dirname))
  assert.not.ok(isFileSync('a'))
})

test.run()
