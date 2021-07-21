'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const injectBridgeMarkupPlugin = require('../plugins/t-markup-inject-bridge')
const { createTestContext, transformMarkup } = require('./_utils')

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
        <script type="module" src="/~/bridge.js" async></script>
      </head>
      <body></body>
    </html>
  `

  const plugin = injectBridgeMarkupPlugin(
    createTestContext()
  )

  assert.is(await transformMarkup(code, plugin), expected)
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
      <head><meta charset="UTF-8"><script type="module" src="/~/bridge.js" async></script></head>
      <body></body>
    </html>
  `

  const plugin = injectBridgeMarkupPlugin(
    createTestContext()
  )

  assert.is(await transformMarkup(code, plugin), expected)
})

test.run()
