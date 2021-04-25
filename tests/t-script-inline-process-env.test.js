/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const inlineProcessEnvScriptPlugin = require('../plugins/t-script-inline-process-env')
const { createContext, transformScript } = require('./_utils')

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
    createContext(null, { a: 'abc' })
  )
  expect(await transformScript(code, plugin)).toBe(expected)
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
    createContext(null, { a: 'abc' })
  )
  expect(await transformScript(code, plugin)).toBe(expected)
})
