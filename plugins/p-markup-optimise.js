'use strict'

const minifier = require('html-minifier')

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

module.exports = {
  extensions: ['.htm', '.html'],
  type: 'html',
  transform: transformMarkupOptimisePlugin
}

function transformMarkupOptimisePlugin (string, context, done) {
  done(null, minifier.minify(string, options))
}
