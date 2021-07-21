'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { FilemapWithAliases } = require('../lib/core-filemap-with-aliases')

const packageScope = '/www'
const wd = '/www/pages'

test('FilemapWithAliases.map', () => {
  const aliases = new Map()
  const filemap = new FilemapWithAliases({ aliases, packageScope, wd })

  assert.is(filemap.map('/www/lib/abc.js'), '/~hldurme/abc.js')
  assert.is(filemap.map('/www/lib/utils.js'), '/~hldurme/utils.js')
  assert.is(filemap.map('/www/static/css/tachyons.css'), '/~jdrquyi/css/tachyons.css')
})

test.run()
