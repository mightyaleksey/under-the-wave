'use strict'

const generate = require('@babel/generator').default
const parse = require('@babel/core').parseSync
const transform = require('@babel/core').transformFromAstSync

const modulePlugins = [
  require('./t-script-inline-process-env'),
  require('./t-script-evaluate-conditionals'),
  require('./t-script-convert-cjs-modules'),
  require('./t-script-update-module-path')
]

module.exports = {
  extensions: ['.js', '.mjs'],
  type: 'js',
  parse: parseScriptCorePlugin,
  transform: transformScriptCorePlugin,
  stringify: stringifyScriptCorePlugin
}

function parseScriptCorePlugin (string, context, done) {
  const babel = context.settings.babel
  // https://babeljs.io/docs/en/babel-parser#options
  const options = {
    parserOpts: {
      sourceFilename: context.abspath,
      sourceType: 'module'
    },
    plugins: babel.plugins,
    presets: babel.presets
  }

  done(null, parse(string, options))
}

function transformScriptCorePlugin (ast, context, done) {
  const babel = context.settings.babel
  // https://babeljs.io/docs/en/options
  const options = {
    ast: true,
    cloneInputAst: false,
    code: false,
    plugins: modulePlugins.map(plugin => plugin(context)).concat(babel.plugins),
    presets: babel.presets
  }

  const r = transform(ast, null, options)

  done(null, r.ast)
}

function stringifyScriptCorePlugin (ast, context, done) {
  // https://babeljs.io/docs/en/babel-generator#options
  const options = {
    comments: true,
    compact: false,
    retainLines: true,
    minified: false,
    filename: context.abspath
  }

  const r = generate(ast, options)
  done(null, r.code)
}
