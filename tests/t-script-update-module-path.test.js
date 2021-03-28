/* globals expect,test */
'use strict'

const path = require('path')

const { transformScript } = require('./utils')
const updateModulePathScriptPlugin = require('../lib/t-script-update-module-path')

test('inline process.env values', async () => {
  const abspath = '/'
  const resolve = (a, b) => path.resolve(a, b)

  const code = `
    import a from './a'
    import './b'
  `
  const expected = `
import a from '/a';
import '/b';
  `.trim()

  const result = await transformScript(code, updateModulePathScriptPlugin(abspath, resolve))
  expect(result).toBe(expected)
})
