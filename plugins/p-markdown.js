'use strict'

const fm = require('yaml-front-matter')
const marked = require('marked')
const posthtml = require('posthtml')

module.exports = {
  extensions: ['.md'],
  for: '.html',
  transform: transformMarkdownPlugin,
  type: 'markdown'
}

function transformMarkdownPlugin (string, context, done) {
  const meta = fm.loadFront(string)
  const markup = marked(meta.__content)
  if (meta.layout == null) {
    done(null, markup)
    return
  }

  context.request(meta.layout)
    .then(buffer => {
      const template = buffer.toString('utf8')
      // keep in mind that matching html plugins will be applied one more time after,
      // thus some plugins may be applied twice
      return posthtml(markdownPlugin(markup)).process(template)
    })
    .then(result => done(null, result.html), done)
}

function markdownPlugin (markup) {
  return tree => tree.walk(node => {
    if (node.tag === 'markdown') {
      return markup
    }

    return node
  })
}
