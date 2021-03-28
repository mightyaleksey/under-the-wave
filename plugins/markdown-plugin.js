'use strict'

const fm = require('yaml-front-matter')
const fs = require('fs')
const marked = require('marked')
const path = require('path')
const posthtml = require('posthtml')

// example of external plugin
module.exports = {
  alias: '.html',
  extensions: ['.md'],
  name: 'markdown',
  transform: transformMarkdown
}

async function transformMarkdown (abspath, content) {
  const attrs = fm.loadFront(content)
  const markup = marked(attrs.__content)
  if (attrs.layout != null) {
    const filepath = path.resolve(path.dirname(abspath), attrs.layout)
    const template = await fs.promises.readFile(filepath, 'utf8')
    const result = await posthtml(markdownPlugin(markup)).process(template)
    return result.html
  }
  return markup
}

function markdownPlugin (markup) {
  return tree => tree.walk(node => {
    if (node.tag === 'markdown') {
      return markup
    }

    return node
  })
}
