/* globals expect,test */
'use strict'

const { transformScript } = require('./utils')
const inlineProcessEnvScriptPlugin = require('../lib/t-script-inline-process-env')

test('inline process.env values', async () => {
  const env = { a: 'abc' }

  const code = `
    console.log(process.env)
    console.log(process.env.a)
    console.log(process.env.a[1])
  `
  const expected = `
console.log({});
console.log('abc');
console.log('b');
  `.trim()

  const result = await transformScript(code, inlineProcessEnvScriptPlugin(env))
  expect(result).toBe(expected)
})

test.skip('respect already defined process variable', async () => {
  const env = { a: 'abc' }

  const code = `
    var process = {}
    console.log(process.env)
  `
  const expected = `
var process = {};
console.log(process.env);
  `.trim()

  const result = await transformScript(code, inlineProcessEnvScriptPlugin(env))
  expect(result).toBe(expected)
})
