'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { ListItem } = require('../lib/core-data-structures')
const { Urlmap } = require('../lib/core-urlmap')

const packageScope = path.resolve(__dirname, 'fixture')
const referer = path.join(packageScope, '_')

const output = path.join(packageScope, 'index.html')

test('Urlmap.map "./x" path', () => {
  const aliases = new Map()
  const urlmap = new Urlmap({ aliases, packageScope })

  assert.is(urlmap.map('./index.html', referer), output)
})

test('Urlmap.map "/x" path', () => {
  const aliases = new Map()
  const urlmap = new Urlmap({ aliases, packageScope })

  assert.is(urlmap.map(output, referer), output)
})

test('Urlmap.map "~/x" path', () => {
  const aliases = new Map()
  const urlmap = new Urlmap({ aliases, packageScope })

  assert.is(urlmap.map('./~/index.html', referer), output)
  assert.is(urlmap.map('~/index.html', referer), output)
})

test('Urlmap.map "~st/x" path', () => {
  const aliasPath = path.join(packageScope, 'static')
  const aliases = new Map([['~st', aliasPath]])
  const output = path.join(packageScope, 'static/hello.js')
  const urlmap = new Urlmap({ aliases, packageScope })

  assert.is(urlmap.map('./~st/hello.js', referer), output)
  assert.is(urlmap.map('~st/hello.js', referer), output)
})

test('Urlmap.map → public file', () => {
  const aliases = new Map()
  const staticDirs = ListItem.from(path.join(packageScope, 'public'))
  const output = path.join(packageScope, 'public/robots.txt')
  const urlmap = new Urlmap({ aliases, packageScope, staticDirs })

  assert.is(urlmap.map('/robots.txt', referer), output)
})

test('Urlmap.map → "null" for not existing file', () => {
  const aliases = new Map()
  const urlmap = new Urlmap({ aliases, packageScope })

  assert.is(urlmap.map('./unknown.html', referer), null)
})

test.run()
