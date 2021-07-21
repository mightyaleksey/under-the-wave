'use strict'

// https://babeljs.io/docs/en/usage#core-library
const { transformSync } = require('@babel/core')

const modulePlugins = [
  require('./t-script-inline-process-env'),
  require('./t-script-evaluate-conditionals'),
  require('./t-script-convert-cjs-modules'),
  require('./t-script-update-module-path')
]

module.exports = {
  extensions: ['.js', '.mjs'],
  for: '.js',
  transform: transformScriptCorePlugin,
  type: 'script'
}

function transformScriptCorePlugin (string, context, done) {
  const packagePlugins = context.settings.babel?.plugins ?? []
  const packagePresets = context.settings.babel?.presets ?? []

  // https://babeljs.io/docs/en/options
  const options = {
    // primary
    cwd: context.settings.scope,
    code: true,
    ast: false,
    cloneInputAst: false,
    // config
    babelrc: false,
    configFile: false,
    // plugins & presets
    plugins: modulePlugins.map(plugin => plugin(context)).concat(packagePlugins),
    presets: packagePresets,
    // misc
    sourceType: 'module',
    parserOpts: {}, // https://babeljs.io/docs/en/babel-parser#options
    generatorOpts: { // https://babeljs.io/docs/en/options/#code-generator-options
      retainLines: true,
      compact: false,
      minified: false,
      comments: true
    }
  }

  const result = transformSync(string, options)

  done(null, result.code)
}
