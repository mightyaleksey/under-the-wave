/* globals expect,test */
'use strict'

const path = require('path')
const posthtml = require('posthtml')

const Resolver = require('../lib/resolver')
const UrlMapper = require('../lib/url-mapper')
const pluginFixFilePath = require('../lib/t-posthtml-fix-file-path')

async function transform (content, plugins) {
  const result = await posthtml(plugins).process(content)
  return result.html
}

test('handle different file paths', async () => {
  const resolver = new Resolver()
  const urlmapper = new UrlMapper({ base: path.join(__dirname, '..') })

  const abspath = __filename
  const resolve = (a, b) => urlmapper.url(
    resolver.resolveSync(a, b)
  )

  const code = `
    <img src='./t-posthtml-fix-file-path.test.js' />
    <img src='t-posthtml-fix-file-path.test.js' />
  `
  const expected = `
    <img src="/tests/t-posthtml-fix-file-path.test.js">
    <img src="/tests/t-posthtml-fix-file-path.test.js">
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})

test('update img path', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    <img src='./a.png' />
  `
  const expected = `
    <img src="/a.png">
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})

test('update link path', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    <link rel='stylesheet' href='./a.css' />
  `
  const expected = `
    <link rel="stylesheet" href="/a.css">
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})

test('update script path', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    <script type=module src=./a.js></script>
    <script type="text/javascript" src=./b.js></script>
    <script src=./c.js></script>
  `
  const expected = `
    <script type="module" src="/a.js?t=m"></script>
    <script type="text/javascript" src="/b.js"></script>
    <script src="/c.js"></script>
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})
