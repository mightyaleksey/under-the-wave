'use strict'

const babel = require('@babel/core')

const pluginCommonjsModules = require('./t-babel-commonjs-modules')
const pluginFixModulePath = require('./t-babel-fix-module-path')
const pluginInlineProcessEnv = require('./t-babel-inline-process-env')
const pluginUnfoldCondition = require('./t-babel-unfold-condition')

module.exports = {
  name: 'script',
  async transform (content, abspath, resolve, context) {
    const options = {
      ast: false,
      cloneInputAst: false,
      code: true,
      comments: true,
      compact: false,
      minified: false,
      retainLines: true,
      plugins: [
        pluginInlineProcessEnv(context),
        pluginUnfoldCondition(),
        pluginCommonjsModules(),
        pluginFixModulePath({ abspath, resolve })
      ]
    }

    const result = await babel.transformAsync(content, options)
    return result.code
  }
}
