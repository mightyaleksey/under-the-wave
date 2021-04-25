/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { transformMarkup, transformScript, transformStyle } = require('./_utils')

test('transformMarkup', async () => {
  const code = '<html></html>'
  const expected = '<html></html>'
  expect(await transformMarkup(code)).toBe(expected)
})

test('transformScript', async () => {
  const code = 'console.log()'
  const expected = 'console.log();'
  expect(await transformScript(code)).toBe(expected)
})

test('transformStyle', async () => {
  const code = 'body { color: #272727 }'
  const expected = 'body{color:#272727}'
  const plugin = node => {}
  expect(await transformStyle(code, plugin)).toBe(expected)
})
