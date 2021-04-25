'use strict'

const csso = require('csso')

module.exports = {
  extensions: ['.css'],
  type: 'css',
  transform: transformStyleOptimisePlugin
}

function transformStyleOptimisePlugin (string, context, done) {
  done(null, csso.minify(string).css)
}
