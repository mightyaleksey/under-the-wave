'use strict'

const posthtml = require('posthtml')

const pluginFixFilePath = require('./t-posthtml-fix-file-path')
const pluginInlinedContent = require('./t-posthtml-inlined-content')

module.exports = {
  name: 'markup',
  async transform (content, abspath, resolve, context) {
    const plugins = [
      pluginFixFilePath(abspath, resolve),
      pluginInlinedContent(abspath, resolve, context)
    ]
    const result = await posthtml(plugins).process(content)

    return result.html
  }
}
