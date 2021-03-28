/* globals expect,test */
'use strict'

const { transformScript } = require('./utils')
const evaluateConditionalsScriptPlugin = require('../lib/t-script-evaluate-conditionals')

test('evaluate unary and binary operators', async () => {
  const code = `
    /* falsy */

    if (!!0) {}
    if (!'a') {}
    if ('a' != 'a') {}
    if ('a' !== 'a') {}
    if ('a' && false) {}
    if ('a' == 'b') {}
    if ('a' === 'b') {}
    if (false || false) {}

    /* truthy */

    if (!!1) {}
    if (!0) {}
    if ('a' != 'b') {}
    if ('a' !== 'b') {}
    if ('a' && true) {}
    if ('a' == 'a') {}
    if ('a' === 'a') {}
    if (false || true) {}
  `
  const expected = `
if (!!1) {
}
if (!0) {
}
if ('a' != 'b') {
}
if ('a' !== 'b') {
}
if ('a' && true) {
}
if ('a' == 'a') {
}
if ('a' === 'a') {
}
if (false || true) {
}

  `.trim()

  const result = await transformScript(code, evaluateConditionalsScriptPlugin())
  expect(result).toBe(expected)
})

test('evaluate literals', async () => {
  const code = `
    /* falsy */

    if ('') {}
    if (0) {}
    if (false) {}
    if (null) {}
    if (undefined) {}

    /* truthy */

    if ('a') {}
    if (1) {}
    if (true) {}
  `
  const expected = `
if ('a') {
}
if (1) {
}
if (true) {
}
  `.trim()

  const result = await transformScript(code, evaluateConditionalsScriptPlugin())
  expect(result).toBe(expected)
})

test('handle branches', async () => {
  const code = `
    if (false) { a() } else { b() }

    if (true) { a() } else { b() }

    if (false) { a() } else if (true) { b() } else { c() }
  `
  const expected = `
{
    b();
}
if (true) {
    a();
}
if (true) {
    b();
}
  `.trim()

  const result = await transformScript(code, evaluateConditionalsScriptPlugin())
  expect(result).toBe(expected)
})

test('undefined identifier', async () => {
  const code = `
    if (undefined) { /* 1 */ }
    if (!undefined) { /* 2 */ }
  `
  const expected = `
if (!undefined) {
}
  `.trim()

  const result = await transformScript(code, evaluateConditionalsScriptPlugin())
  expect(result).toBe(expected)
})
