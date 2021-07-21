'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const inlineProcessEnvScriptPlugin = require('../plugins/t-script-inline-process-env')
const { createTestContext, transformScript } = require('./_utils')

test('inline process.env values', async () => {
  const code = `
  console.log(process.env)
  console.log(process.env.a)
  console.log(process.env.a[1])
`
  const expected = `
console.log({});
console.log("abc");
console.log("b");
`.trim()

  const plugin = inlineProcessEnvScriptPlugin(
    createTestContext(null, { a: 'abc' })
  )

  assert.is(await transformScript(code, plugin), expected)
})

test('respect already defined process variable', async () => {
  const code = `
    var process = {}
    console.log(process.env)
  `
  const expected = `
var process = {};
console.log(process.env);
  `.trim()

  const plugin = inlineProcessEnvScriptPlugin(
    createTestContext(null, { a: 'abc' })
  )

  assert.is(await transformScript(code, plugin), expected)
})

test.run()
