/* globals expect,test */
'use strict'

const babel = require('@babel/core')

const pluginInlineProcessEnv = require('../lib/t-babel-inline-process-env')

async function transform (content, plugins) {
  const options = { ast: false, cloneInputAst: false, code: true, plugins: plugins }
  const result = await babel.transformAsync(content, options)
  return result.code
}

test('inline process.env values', async () => {
  const env = { a: 'abc' }

  const code = `
    console.log(process.env)
    console.log(process.env.a)
    console.log(process.env.a[1])
    // process.env.a
    f.process.env
  `
  const expected = `
console.log({});
console.log("abc");
console.log("b"); // process.env.a

f.process.env;
  `.trim()

  const result = await transform(code, [pluginInlineProcessEnv({ env })])
  expect(result).toBe(expected)
})

test('handle missing process.env values', async () => {
  const env = { }

  const code = `
    console.log(process.env.a)
    console.log(process.env.a.b)
    console.log(process.env.a[0])
  `
  const expected = `
console.log(null);
console.log(null);
console.log(null);
  `.trim()

  const result = await transform(code, [pluginInlineProcessEnv({ env })])
  expect(result).toBe(expected)
})

test('real world', async () => {
  const env = { NODE_ENV: 'development' }

  const code = `
    if (process.env.NODE_ENV === 'development') {
      a()
    } else if (process.env.NODE_ENV === 'production') {
      b()
    }
  `
  const expected = `
if ("development" === 'development') {
  a();
} else if ("development" === 'production') {
  b();
}
  `.trim()

  const result = await transform(code, [pluginInlineProcessEnv({ env })])
  expect(result).toBe(expected)
})
