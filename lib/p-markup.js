'use strict'

const posthtml = require('posthtml')

const inlinedContentMarkupPlugin = require('./t-markup-inlined-content')
const tagModuleMarkupPlugin = require('./t-markup-tag-module')

module.exports = {
  name: 'markup',
  transform: transformMarkup
}

// handle inlined content
// address non-module scripts
async function transformMarkup (abspath, content, resolve, env, sourceType) {
  const plugins = [
    inlinedContentMarkupPlugin(abspath, resolve, env),
    tagModuleMarkupPlugin
  ]
  const result = await posthtml(plugins).process(content)

  return result.html
}
