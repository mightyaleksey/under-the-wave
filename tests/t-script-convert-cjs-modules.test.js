/* globals expect,test */
'use strict'

const { transformScript } = require('./utils')
const convertCjsModulesScriptPlugin = require('../lib/t-script-convert-cjs-modules')

test('handle require calls', async () => {
  const code = `
    'use strict';

    require('a')
    var b = require('b')
  `
  const expected = `
'use strict';
import * as _c from 'a';
import * as _d from 'b';
var _a = _c.default || _c, _b = _d.default || _d;
_a;
var b = _b;
  `.trim()

  const result = await transformScript(code, convertCjsModulesScriptPlugin())
  expect(result).toBe(expected)
})

test('handle exports = require()', async () => {
  const code = `
    'use strict';
    module.exports = require('a')
  `
  const expected = `
'use strict';
export * from 'a';
  `.trim()

  const result = await transformScript(code, convertCjsModulesScriptPlugin())
  expect(result).toBe(expected)
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
export {
    _a as default,
    _b as b
};
  `.trim()

  const result = await transformScript(code, convertCjsModulesScriptPlugin())
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
export {
    _a as Fragment
};
  `.trim()

  const result = await transformScript(code, convertCjsModulesScriptPlugin())
  expect(result).toBe(expected)
})
