/* globals expect,test */
'use strict'

const csstree = require('css-tree')
const path = require('path')

const pluginFixFilePath = require('../lib/t-csstree-fix-file-path')

async function transform (content, plugin) {
  const ast = csstree.parse(content)
  csstree.walk(ast, plugin)
  return csstree.generate(ast)
}

test('@import', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    @import url('./a');
  `
  const expected = `
    @import url("/a");
  `.trim()

  const result = await transform(code, pluginFixFilePath(abspath, resolve))
  expect(result).toBe(expected)
})

test('background', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    .foo { background: url('foo.jpg'); }
  `
  const expected = `
    .foo{background:url("/foo.jpg")}
  `.trim()

  const result = await transform(code, pluginFixFilePath(abspath, resolve))
  expect(result).toBe(expected)
})

test('background-image', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    .bar { background-image: url(bar.png); }
  `
  const expected = `
    .bar{background-image:url(/bar.png)}
  `.trim()

  const result = await transform(code, pluginFixFilePath(abspath, resolve))
  expect(result).toBe(expected)
})
