/* globals expect,test */
'use strict'

const babel = require('@babel/core')

const pluginUnfoldCondition = require('../lib/t-babel-unfold-condition')

async function transform (content, plugins) {
  const options = { ast: false, cloneInputAst: false, code: true, plugins: plugins }
  const result = await babel.transformAsync(content, options)
  return result.code
}

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
/* falsy */

/* truthy */
if (!!1) {}

if (!0) {}

if ('a' != 'b') {}

if ('a' !== 'b') {}

if ('a' && true) {}

if ('a' == 'a') {}

if ('a' === 'a') {}

if (false || true) {}

  `.trim()

  const result = await transform(code, [pluginUnfoldCondition()])
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
/* falsy */

/* truthy */
if ('a') {}

if (1) {}

if (true) {}
  `.trim()

  const result = await transform(code, [pluginUnfoldCondition()])
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
} else {}

if (true) {
  b();
} else {}
  `.trim()

  const result = await transform(code, [pluginUnfoldCondition()])
  expect(result).toBe(expected)
})

test('undefined identifier', async () => {
  const code = `
    if (undefined) { /* 1 */ }
    if (!undefined) { /* 2 */ }
  `
  const expected = `
if (!undefined) {
  /* 2 */
}
  `.trim()

  const result = await transform(code, [pluginUnfoldCondition()])
  expect(result).toBe(expected)
})
