/* globals expect,test */
'use strict'

const path = require('path')
const posthtml = require('posthtml')

const pluginInlinedContent = require('../lib/t-posthtml-inlined-content')

async function transform (content, plugins) {
  const result = await posthtml(plugins).process(content)
  return result.html
}

test('handle empty input properly', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)
  const context = {}

  const code = ''
  const expected = ''

  const result = await transform(code, [pluginInlinedContent(abspath, resolve, context)])
  expect(result).toBe(expected)
})

test('transform script', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)
  const context = {}

  const code = `
    <script type=module>import './a.js'</script>
  `
  const expected = `
    <script type="module">import "/a.js";</script>
  `

  const result = await transform(code, [pluginInlinedContent(abspath, resolve, context)])
  expect(result).toBe(expected)
})

test('transform style', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)
  const context = {}

  const code = `
    <style>.a { background: url(./a.png); }</style>
  `
  const expected = `
    <style>.a { background: url(/a.png); }</style>
  `

  const result = await transform(code, [pluginInlinedContent(abspath, resolve, context)])
  expect(result).toBe(expected)
})
