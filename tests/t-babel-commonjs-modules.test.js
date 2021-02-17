/* globals expect,test */
'use strict'

const babel = require('@babel/core')

const pluginCommonjsModules = require('../lib/t-babel-commonjs-modules')

async function transform (content, plugins) {
  const options = { ast: false, cloneInputAst: false, code: true, plugins: plugins }
  const result = await babel.transformAsync(content, options)
  return result.code
}

test('transform imports', async () => {
  const code = `
    const a = require('./a')
    const b = require('./b').ee

    let c
    c = require('./a')
    {
      c = require('./b').ee
    }
  `
  const expected = `
import * as _c from "./a";
import * as _d from "./b";

var _a = _c.default || _c,
    _b = _d.default || _d;

const a = _a;
const b = _b.ee;
let c;
c = _a;
{
  c = _b.ee;
}
  `.trim()

  const result = await transform(code, [pluginCommonjsModules()])
  expect(result).toBe(expected)
})

test('transform exports', async () => {
  const code = `
    module.exports = 'a'
    module.exports.b = 'b'
    {
      exports = 'c'
      exports.b = 'd'
    }
  `
  const expected = `
var _a, _b;

_a = 'a';
_b = 'b';
{
  _a = 'c';
  _b = 'd';
}
export { _a as default, _b as b };
  `.trim()

  const result = await transform(code, [pluginCommonjsModules()])
  expect(result).toBe(expected)
})

test('transform mixed', async () => {
  const code = `
    module.exports = require('./a')
  `
  const expected = `
export * from "./a";
  `.trim()

  const result = await transform(code, [pluginCommonjsModules()])
  expect(result).toBe(expected)
})

test('real world', async () => {
  const code = `
    if (type === exports.Fragment) {
      validateFragmentProps(element);
    }
  `
  const expected = `
var _a;

if (type === _a) {
  validateFragmentProps(element);
}

export { _a as Fragment };
  `.trim()

  const result = await transform(code, [pluginCommonjsModules()])
  expect(result).toBe(expected)
})
