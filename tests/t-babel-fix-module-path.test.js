/* globals expect,test */
'use strict'

const babel = require('@babel/core')
const path = require('path')

const pluginFixModulePath = require('../lib/t-babel-fix-module-path')

async function transform (content, plugins) {
  const options = { ast: false, cloneInputAst: false, code: true, plugins: plugins }
  const result = await babel.transformAsync(content, options)
  return result.code
}

test('fix module paths', async () => {
  const options = {
    abspath: '/',
    resolve (a, b) {
      return path.resolve(a, b)
    }
  }

  const code = `
    import a from './a'
    import './b'
  `
  const expected = `
import a from "/a";
import "/b";
  `.trim()

  const result = await transform(code, [pluginFixModulePath(options)])

  expect(result).toBe(expected)
})
