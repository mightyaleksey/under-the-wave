'use strict'

const minifier = require('html-minifier')
const posthtml = require('posthtml')

const pluginFixFilePath = require('./t-posthtml-fix-file-path')

module.exports = {
  name: 'markup',
  async transform (content, abspath, resolve) {
    const plugins = [pluginFixFilePath({ abspath, resolve })]
    const result = await posthtml(plugins).process(content)

    return result.html
  },
  async minify (content) {
    const options = {
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: false,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      sortAttributes: true,
      sortClassName: true,
      useShortDoctype: true
    }

    return minifier.minify(content, options)
  }
}
