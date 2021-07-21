'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { resolveUrl } = require('../lib/core-resolve')

const projectRoot = path.resolve(__dirname, 'fixture')

test('resolveUrl → "hello.js" with "" extension', () => {
  const referer = path.join(projectRoot, 'index.html')
  const options = { extensions: [''] }

  assert.is(
    resolveUrl('./static/hello.js', referer, options),
    path.join(projectRoot, 'static/hello.js')
  )
})

test('resolveUrl → "hello.js" with ".js" extension', () => {
  const referer = path.join(projectRoot, 'index.html')
  const options = { extensions: ['.js'] }

  assert.is(
    resolveUrl('./static/hello.js', referer, options),
    path.join(projectRoot, 'static/hello.js')
  )
})

test('resolveUrl → "counter.demo.js" with ".js" extension', () => {
  const referer = path.join(projectRoot, 'index.html')
  const options = { extensions: ['.js'] }

  assert.is(
    resolveUrl('./static/counter.demo.js', referer, options),
    path.join(projectRoot, 'static/counter.demo.js')
  )
})

test.run()
