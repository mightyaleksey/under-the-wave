'use strict'

const csstree = require('css-tree')

const updateAssetPathStylePlugin = require('./t-style-update-asset-path')

module.exports = {
  extensions: ['.css'],
  type: 'css',
  transform: transformStyleCorePlugin
}

function transformStyleCorePlugin (string, context, done) {
  const ast = csstree.parse(string)
  csstree.walk(ast, updateAssetPathStylePlugin(context))
  done(null, csstree.generate(ast))
}
