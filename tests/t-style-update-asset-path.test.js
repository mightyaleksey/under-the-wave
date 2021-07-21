'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const updateAssetPathStylePlugin = require('../plugins/t-style-update-asset-path')
const { createTestContext, transformStyle } = require('./_utils')

test('handle url', async () => {
  const code = `
    body {
      background-image: url(./bg1.jpg);
      background-image: url('./bg2.jpg');
    }
  `
  const expected = `
    body{background-image:url(/bg1.jpg);background-image:url(/bg2.jpg)}
  `.trim()

  const plugin = updateAssetPathStylePlugin(
    createTestContext()
  )

  assert.is(await transformStyle(code, plugin), expected)
})

test.run()
