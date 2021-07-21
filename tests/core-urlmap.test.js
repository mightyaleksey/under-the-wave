'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { Urlmap } = require('../lib/core-urlmap')

const projectRoot = path.resolve(__dirname, 'fixture')
const referer = path.join(projectRoot, '_')
const output = path.join(projectRoot, 'index.html')

test('Urlmap.map "./x" path', () => {
  const urlmap = new Urlmap()

  assert.is(urlmap.map('./index.html', referer), output)
})

test('Urlmap.map → "null" for not existing file', () => {
  const urlmap = new Urlmap()

  assert.is(urlmap.map('./unknown.html', referer), null)
})

test.run()
