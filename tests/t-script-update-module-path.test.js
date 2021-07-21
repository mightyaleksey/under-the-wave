'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const updateModulePathScriptPlugin = require('../plugins/t-script-update-module-path')
const { createTestContext, transformScript } = require('./_utils')

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
    createTestContext()
  )

  assert.is(await transformScript(code, plugin), expected)
})
