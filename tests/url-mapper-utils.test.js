/* globals expect,test */
'use strict'

const { addparam, moduletype } = require('../lib/url-mapper-utils')

test('addparam', () => {
  expect(addparam('./foo.js', 't', 'm')).toBe('./foo.js?t=m')
  expect(addparam('./foo.js?a=b', 't', 'm')).toBe('./foo.js?a=b&t=m')
})

test('moduletype', () => {
  expect(moduletype('/foo.mjs')).toBe('module')
  expect(moduletype('/foo.js?t=m')).toBe('module')
  expect(moduletype('/foo.js')).toBe('script')
  expect(moduletype('/')).toBe(null)
})
