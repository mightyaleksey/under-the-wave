'use strict'

const acorn = require('acorn')
const escodegen = require('escodegen')

const { walk } = require('./t-script-utils-walk')
const scopePlugin = require('./t-script-utils-scope')

const convertCjsModulesScriptPlugin = require('./t-script-convert-cjs-modules')
const evaluateConditionalsScriptPlugin = require('./t-script-evaluate-conditionals')
const inlineProcessEnvScriptPlugin = require('./t-script-inline-process-env')
const tagModuleScriptPlugin = require('./t-script-tag-module')
const updateModulePathScriptPlugin = require('./t-script-update-module-path')

module.exports = {
  name: 'script',
  transform: transformScript
}

async function transformScript (abspath, content, resolve, env, sourceType) {
  const ast = typeof content === 'string'
    ? acorn.parse(content, { ecmaVersion: 'latest', sourceType: sourceType })
    : content
  walk(ast, [inlineProcessEnvScriptPlugin(env)], scopePlugin())
  walk(ast, [
    evaluateConditionalsScriptPlugin(),
    sourceType === 'module' && convertCjsModulesScriptPlugin(abspath, resolve),
    sourceType === 'module' && updateModulePathScriptPlugin(abspath, resolve),
    sourceType === 'module' && tagModuleScriptPlugin()
  ], scopePlugin())
  return escodegen.generate(ast)
}
