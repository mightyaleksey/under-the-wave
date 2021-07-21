'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const updateAssetPathMarkupPlugin = require('../plugins/t-markup-update-asset-path')
const { createTestContext, transformMarkup } = require('./_utils')

test('handle generic cases', async () => {
  const code = `
    <a href='./foo.html'></a>
    <img src='./promo.png' />
    <link href='./app.css' />
    <script src='./app.js'></script>
  `
  const expected = `
    <a href="/foo.html"></a>
    <img src="/promo.png">
    <link href="/app.css">
    <script src="/app.js"></script>
  `

  const plugin = updateAssetPathMarkupPlugin(
    createTestContext()
  )

  assert.is(await transformMarkup(code, plugin), expected)
})

test('handle audio and video', async () => {
  const code = `
    <audio src='./demo.mp3'></audio>
    <audio>
      <source src='./demo.mp3'>
    </audio>

    <video>
      <source src='./preview.mp4'>
    </video>
  `
  const expected = `
    <audio src="/demo.mp3"></audio>
    <audio>
      <source src="/demo.mp3">
    </audio>

    <video>
      <source src="/preview.mp4">
    </video>
  `

  const plugin = updateAssetPathMarkupPlugin(
    createTestContext()
  )

  assert.is(await transformMarkup(code, plugin), expected)
})

test.run()
