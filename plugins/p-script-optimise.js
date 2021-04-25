'use strict'

const uglify = require('uglify-js')

module.exports = {
  extensions: ['.js', '.mjs'],
  type: 'js',
  transform: transformScriptOptimisePlugin
}

function transformScriptOptimisePlugin (string, context, done) {
  const r = uglify.minify(string)
  if (r.error != null) done(r.error)
  else done(null, r.code)
}
