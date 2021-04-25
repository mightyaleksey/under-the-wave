/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const convertCjsModulesScriptPlugin = require('../plugins/t-script-convert-cjs-modules')
const { createContext, transformScript } = require('./_utils')

test('handle require calls', async () => {
  const code = `
    'use strict';

    require('a')
    var b = require('b')
  `
  const expected = `
'use strict';

import * as _c from "a";
import * as _d from "b";

var _a = _c.default || _c,
    _b = _d.default || _d;

_a;
var b = _b;
  `.trim()

  const plugin = convertCjsModulesScriptPlugin(
    createContext()
  )
  expect(await transformScript(code, plugin)).toBe(expected)
})

test('handle exports = require()', async () => {
  const code = `
    'use strict';
    module.exports = require('a')
  `
  const expected = `
'use strict';

export * from "a";
  `.trim()

  const plugin = convertCjsModulesScriptPlugin(
    createContext()
  )
  expect(await transformScript(code, plugin)).toBe(expected)
})

test('handle exports', async () => {
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

  const plugin = convertCjsModulesScriptPlugin(
    createContext()
  )
  expect(await transformScript(code, plugin)).toBe(expected)
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

  const plugin = convertCjsModulesScriptPlugin(
    createContext()
  )
  expect(await transformScript(code, plugin)).toBe(expected)
})
