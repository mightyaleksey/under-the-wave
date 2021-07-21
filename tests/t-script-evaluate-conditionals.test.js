'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const evaluateConditionalsScriptPlugin = require('../plugins/t-script-evaluate-conditionals')
const { createTestContext, transformScript } = require('./_utils')

test('evaluate unary and binary operators', async () => {
  const code = `
    /* falsy */

    if (!!!1) {}
    if (!!0) {}
    if (!'a') {}
    if ('a' != 'a') {}
    if ('a' !== 'a') {}
    if ('a' && false) {}
    if ('a' == 'b') {}
    if ('a' === 'b') {}
    if (false || false) {}

    /* truthy */

    if (!!!0) {}
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
if (!!!0) {}

if (!!1) {}

if (!0) {}

if ('a' != 'b') {}

if ('a' !== 'b') {}

if ('a' && true) {}

if ('a' == 'a') {}

if ('a' === 'a') {}

if (false || true) {}
  `.trim()

  const plugin = evaluateConditionalsScriptPlugin(
    createTestContext()
  )

  assert.is(await transformScript(code, plugin), expected)
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

  const plugin = evaluateConditionalsScriptPlugin(
    createTestContext()
  )

  assert.is(await transformScript(code, plugin), expected)
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

  const plugin = evaluateConditionalsScriptPlugin(
    createTestContext()
  )

  assert.is(await transformScript(code, plugin), expected)
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

  const plugin = evaluateConditionalsScriptPlugin(
    createTestContext()
  )

  assert.is(await transformScript(code, plugin), expected)
})

test.run()
