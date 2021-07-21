'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { UrlmapWithAliases } = require('../lib/core-urlmap-with-aliases')

const projectRoot = path.resolve(__dirname, 'fixture')
const referer = path.join(projectRoot, '_')
const output = path.join(projectRoot, 'index.html')

test('Urlmap.map "./x" path', () => {
  const aliases = new Map()
  const urlmap = new UrlmapWithAliases({ aliases })

  aliases.set('/~w', projectRoot)
  assert.is(urlmap.map('/~w/index.html', referer), output)
})

test.run()
