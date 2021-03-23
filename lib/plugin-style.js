'use strict'

const csstree = require('css-tree')

const pluginFixFilePath = require('./t-csstree-fix-file-path')

module.exports = {
  name: 'style',
  async transform (content, abspath, resolve) {
    const ast = csstree.parse(content)
    csstree.walk(ast, pluginFixFilePath(abspath, resolve))
    return csstree.generate(ast)
  }
}
