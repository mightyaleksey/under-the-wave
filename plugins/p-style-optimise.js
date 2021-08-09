'use strict'

const csso = require('csso')

module.exports = {
  extensions: ['.css'],
  for: '.css',
  transform: transformStyleOptimiseCorePlugin,
  type: 'style optimise'
}

function transformStyleOptimiseCorePlugin (string, context, done) {
  done(null, csso.minify(string).css)
}
