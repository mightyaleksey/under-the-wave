'use strict'

const posthtml = require('posthtml')

const buildPlugins = [
  require('./t-markup-update-asset-path')
]

const servePlugins = [
  require('./t-markup-update-asset-path'),
  require('./t-markup-inject-bridge')
]

module.exports = {
  extensions: ['.htm', '.html'],
  for: '.html',
  transform: transformMarkupCorePlugin,
  type: 'markup'
}

function transformMarkupCorePlugin (string, context, done) {
  const list = context.cmd === 'serve' ? servePlugins : buildPlugins
  const plugins = list.map(plugin => plugin(context))
  posthtml(plugins).process(string).then(r => done(null, r.html), done)
}
