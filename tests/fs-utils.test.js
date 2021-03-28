/* globals expect,test */
'use strict'

const { contentType, isfile, isdirsync, isfilesync, splitPath } = require('../lib/fs-utils')

test('contentType', () => {
  expect(contentType('')).toBe('text/plain')
  expect(contentType('a.js')).toBe('text/javascript')
})

test('isfile', async () => {
  expect(await isfile(__dirname)).toBe(false)
  expect(await isfile(__filename)).toBe(true)
})

test('isdirsync', () => {
  expect(isdirsync(__filename)).toBe(false)
  expect(isdirsync(__dirname)).toBe(true)
})

test('isfilesync', () => {
  expect(isfilesync(__dirname)).toBe(false)
  expect(isfilesync(__filename)).toBe(true)
})

test('splitPath', () => {
  expect(splitPath('/a/b/')).toEqual(['/a/b/', ''])
  expect(splitPath('/a/a.js')).toEqual(['/a/a', '.js'])
})
