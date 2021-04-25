/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const updateAssetPathStylePlugin = require('../plugins/t-style-update-asset-path')
const { createContext, transformStyle } = require('./_utils')

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
    createContext()
  )
  expect(await transformStyle(code, plugin)).toBe(expected)
})
