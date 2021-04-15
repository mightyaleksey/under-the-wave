'use strict'

const acorn = require('acorn')
const escodegen = require('escodegen')
const posthtml = require('posthtml')

const { walk } = require('../lib/t-script-utils-walk')
const scopePlugin = require('../lib/t-script-utils-scope')

function serializeNode (node) {
  if (node == null) return node
  switch (node.type) {
    case 'Identifier':
      return node.type + ' (' + node.name + ')'
    case 'Literal':
      return node.type + ' (' + node.raw + ')'
    case 'Program':
      return node.type + '[' + node.body.length + ']'
    default:
      return node.type
  }
}

function serializeScope (scope) {
  if (scope == null) return '{ }'

  const delimiter = '<'
  let list = ''

  let keys = Object.keys(scope)
  if (keys.length > 0) list += `${keys.join(', ')} `
  scope = Object.getPrototypeOf(scope)

  while (scope != null) {
    keys = Object.keys(scope)
    list += keys.length > 0 ? `${delimiter} ${keys.join(', ')} ` : `${delimiter} `
    scope = Object.getPrototypeOf(scope)
  }

  return `{ ${list}}`
}

async function transformMarkup (content, plugin) {
  const plugins = [plugin]
  const result = await posthtml(plugins).process(content)
  return result.html
}

async function transformScript (content, plugin) {
  const options = { ecmaVersion: 'latest', sourceType: 'module' }
  const ast = acorn.parse(content, options)
  walk(ast, [plugin], scopePlugin())
  return escodegen.generate(ast)
}

module.exports = {
  serializeNode,
  serializeScope,
  transformMarkup,
  transformScript
}
