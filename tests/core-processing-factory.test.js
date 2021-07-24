'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { ProcessingFactory } = require('../lib/core-processing-factory')
const { Processing } = require('../lib/core-processing')

const projectRoot = path.resolve(__dirname, 'fixture')
const referer = path.join(projectRoot, 'index.html')

test('ProcessingFactory.create returns processing instance', () => {
  const plugins = [require('../plugins/p-identity')]
  const processingFactory = new ProcessingFactory({ plugins })
  processingFactory.cmd = 'test'

  const processing = processingFactory.resolve('./static/hello.js', referer)

  assert.instance(processing, Processing)
  assert.is(processing.url, './static/hello.js')
  assert.is(processing.abspath, path.join(projectRoot, './static/hello.js'))
  assert.equal(processing.plugins, plugins)
})

test('ProcessingFactory.create maps ".html" file to ".md"', () => {
  const plugin = require('../plugins/p-markdown')
  const processingFactory = new ProcessingFactory({ plugins: [plugin] })
  processingFactory.cmd = 'test'

  assert.not.ok(plugin.extensions.includes(plugin.for))
  assert.instance(processingFactory.resolve('./readme.html', referer), Processing)
})

test.run()
