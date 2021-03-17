/* globals expect,test */
'use strict'

const path = require('path')

const Resolver = require('../lib/resolver')
const UrlMapper = require('../lib/url-mapper')

const projectRelative = abspath => path.relative(path.join(__dirname, '..'), abspath)

test('transform file into url', async () => {
  const urlmapper = new UrlMapper({ base: __dirname })
  const file = path.join(__dirname, 'a', 'b')
  expect(urlmapper.url(file)).toBe('/a/b')
})

test('transform url into file', async () => {
  const urlmapper = new UrlMapper({ base: __dirname })
  expect(projectRelative(urlmapper.file('/a/b'))).toBe('tests/a/b')
})

test('should precompute aliases and resolve file', async () => {
  const resolver = new Resolver()
  const urlmapper = new UrlMapper({
    alias: true,
    base: __dirname,
    nodeModules: d => resolver.nodeModules(d)
  })

  // should resolve to project root node_modules folder
  expect(projectRelative(urlmapper.file('/~nma/a'))).toBe('node_modules/a')
})
