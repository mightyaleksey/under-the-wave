'use strict'

const postcss = require('postcss')

const pluginFixFilePath = require('./t-postcss-fix-file-path')

module.exports = {
  name: 'style',
  async transform (content, abspath, resolve) {
    const options = { from: abspath }
    const plugins = [pluginFixFilePath({ abspath, resolve })]
    const result = await postcss(plugins).process(content, options)

    return result.css
  }
}
