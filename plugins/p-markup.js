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
  type: 'html',
  transform: transformMarkupCorePlugin
}

function transformMarkupCorePlugin (string, context, done) {
  const list = context.type === 'serve' ? servePlugins : buildPlugins
  const plugins = list.map(plugin => plugin(context))
  posthtml(plugins).process(string).then(r => done(null, r.html), done)
}
