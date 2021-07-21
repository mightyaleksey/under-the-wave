'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { basenames, extname, foldLevels } = require('../lib/util-path')

test('basenames', () => {
  assert.equal([...basenames('app')], ['app'])
  assert.equal([...basenames('app.page.js')], ['app', 'app.page', 'app.page.js'])
})

test('extname', () => {
  assert.is(extname('/app'), null)
  assert.is(extname('app'), null)
  assert.is(extname('app.page.js'), '.js')
})

test('extname getFullExtension = true', () => {
  assert.is(extname('app.page.js', true), '.page.js')
})

test('foldLevels', () => {
  assert.is(foldLevels('../../lib/page/a'), 'a')
  assert.is(foldLevels('../lib/a'), 'a')
  assert.is(foldLevels('lib/page/a'), 'lib/page/a')
})

test.run()
