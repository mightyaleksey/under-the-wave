'use strict'

const csstree = require('css-tree')

const updateAssetPathStylePlugin = require('./t-style-update-asset-path')

module.exports = {
  extensions: ['.css'],
  for: '.css',
  transform: transformStyleCorePlugin,
  type: 'style'
}

function transformStyleCorePlugin (string, context, done) {
  try {
    const ast = csstree.parse(string)
    csstree.walk(ast, updateAssetPathStylePlugin(context))
    done(null, csstree.generate(ast))
  } catch (err) {
    done(err)
  }
}
