/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const updateModulePathScriptPlugin = require('../plugins/t-script-update-module-path')
const { createContext, transformScript } = require('./_utils')

test('update import paths', async () => {
  const code = `
    import a from './a'
    import './b'
  `
  const expected = `
import a from "/a";
import "/b";
  `.trim()

  const plugin = updateModulePathScriptPlugin(
    createContext()
  )
  expect(await transformScript(code, plugin)).toBe(expected)
})
