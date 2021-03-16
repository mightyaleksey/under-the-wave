'use strict'

const posthtml = require('posthtml')

const pluginFixFilePath = require('./t-posthtml-fix-file-path')

module.exports = {
  name: 'markup',
  async transform (content, abspath, resolve) {
    const plugins = [pluginFixFilePath({ abspath, resolve })]
    const result = await posthtml(plugins).process(content)

    return result.html
  }
}
