/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const injectBridgeMarkupPlugin = require('../plugins/t-markup-inject-bridge')
const { createContext, transformMarkup } = require('./_utils')

test('inject bridge script into head', async () => {
  const code = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
      </head>
      <body></body>
    </html>
  `
  const expected = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <script type="module" src="/~/bridge/" async></script>
      </head>
      <body></body>
    </html>
  `

  const plugin = injectBridgeMarkupPlugin(
    createContext()
  )
  expect(await transformMarkup(code, plugin)).toBe(expected)
})

test('inject bridge script into minified head', async () => {
  const code = `
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8"></head>
      <body></body>
    </html>
  `
  const expected = `
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8"><script type="module" src="/~/bridge/" async></script></head>
      <body></body>
    </html>
  `

  const plugin = injectBridgeMarkupPlugin(
    createContext()
  )
  expect(await transformMarkup(code, plugin)).toBe(expected)
})
