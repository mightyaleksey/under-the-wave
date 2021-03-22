'use strict'

const babel = require('@babel/core')

const pluginCommonjsModules = require('./t-babel-commonjs-modules')
const pluginFixModulePath = require('./t-babel-fix-module-path')
const pluginInlineProcessEnv = require('./t-babel-inline-process-env')
const pluginUnfoldCondition = require('./t-babel-unfold-condition')

module.exports = {
  name: 'script',
  async transform (content, abspath, resolve, context) {
    const plugins = context?.type === 'module'
      ? [ // type=module
          pluginInlineProcessEnv(context),
          pluginUnfoldCondition(),
          pluginCommonjsModules(),
          pluginFixModulePath(abspath, resolve)
        ]
      : [ // type=script
          pluginInlineProcessEnv(context)
        ]

    const options = {
      ast: false,
      babelrc: false,
      cloneInputAst: false,
      code: true,
      comments: true,
      compact: false,
      configFile: false,
      filename: abspath,
      minified: false,
      retainLines: true,
      plugins: plugins
    }

    const result = await babel.transformAsync(content, options)
    const code = result.code

    result.code = null
    if (babel.traverse.cache != null) babel.traverse.cache.clear()

    return code
  }
}
