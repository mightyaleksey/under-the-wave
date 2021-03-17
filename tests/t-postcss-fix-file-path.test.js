/* globals expect,test */
'use strict'

const path = require('path')
const postcss = require('postcss')

const pluginFixFilePath = require('../lib/t-postcss-fix-file-path')

async function transform (content, plugins) {
  const options = { from: __filename }
  const result = await postcss(plugins).process(content, options)
  return result.css
}

test('update @import', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    @import url('./a');
    @import './b';
  `
  const expected = `
    @import url('/a');
    @import './b';
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})

test('update background', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    .foo {
      background: url('./a');
      background-image: url('./b');
    }
  `
  const expected = `
    .foo {
      background: url('/a');
      background-image: url('/b');
    }
  `

  const result = await transform(code, [pluginFixFilePath(abspath, resolve)])
  expect(result).toBe(expected)
})
