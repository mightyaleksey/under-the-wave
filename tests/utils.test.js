/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { contentType, type } = require('../lib/utils')

test('contentType', () => {
  expect(contentType('/app.css')).toBe('text/css')
  expect(contentType('/app.html')).toBe('text/html')
  expect(contentType('/app.js')).toBe('text/javascript')
  expect(contentType('/app.mjs')).toBe('text/javascript')
})

test('type', () => {
  expect(type('/app.js')).toBe('js')
})
