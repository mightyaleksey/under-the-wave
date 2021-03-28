'use strict'

const acorn = require('acorn')
const escodegen = require('escodegen')
const posthtml = require('posthtml')

const { walk } = require('../lib/t-script-utils-walk')

async function transformMarkup (content, plugin) {
  const plugins = [plugin]
  const result = await posthtml(plugins).process(content)
  return result.html
}

async function transformScript (content, plugin) {
  const options = { ecmaVersion: 'latest', sourceType: 'module' }
  const ast = acorn.parse(content, options)
  walk(ast, [plugin])
  return escodegen.generate(ast)
}

module.exports = {
  transformMarkup,
  transformScript
}
