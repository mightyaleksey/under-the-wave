/* globals expect,test */
'use strict'

const path = require('path')

const Resolver = require('../lib/resolver')
const UrlMapper = require('../lib/url-mapper')

const projectScope = path.join(__dirname, '..')
const fromProject = p => path.join(projectScope, p)

test('map file to url', () => {
  const urlmapper = new UrlMapper('/home')
  expect(urlmapper.url('/home/a')).toBe('/a')
})

test('map url to file', () => {
  const urlmapper = new UrlMapper('/home')
  expect(urlmapper.file('/a')).toBe('/home/a')
})

test('apply aliases for modules out of project scope', () => {
  const resolver = new Resolver()
  const urlmapper = new UrlMapper(
    __dirname,
    dirname => resolver.nodeModules(dirname)
  )

  expect(urlmapper.url(fromProject('node_modules/a'))).toBe('/~nma/a')
})

test('unfold aliases', () => {
  const resolver = new Resolver()
  const urlmapper = new UrlMapper(
    __dirname,
    dirname => resolver.nodeModules(dirname)
  )

  expect(urlmapper.file('/~nma/a')).toBe(fromProject('node_modules/a'))
})

test('prettify paths', () => {
  const urlmapper = new UrlMapper('/home')
  expect(urlmapper.url('/home/a/a.js', '/home/index.js')).toBe('./a/a.js')
  expect(urlmapper.url('/home/a/b/b.js', '/home/index.js')).toBe('./a/b/b.js')
  expect(urlmapper.url('/home/index.js', '/home/a/a.js')).toBe('/index.js')
})
