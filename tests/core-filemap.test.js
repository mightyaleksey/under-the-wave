'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { Filemap } = require('../lib/core-filemap')

test('IFilemap.map', () => {
  const filemap = new Filemap({ wd: '/www' })
  // map file to url
  assert.is(filemap.map('/www/index.html'), '/index.html')
  // map file to relative url
  assert.is(filemap.map('/www/static/js/app.js', '/www/index.html'), './static/js/app.js')
})

test.run()
