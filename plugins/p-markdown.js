'use strict'

const fm = require('yaml-front-matter')
const fs = require('fs')
const marked = require('marked')
const path = require('path')
const posthtml = require('posthtml')

// example of external plugin
module.exports = {
  extensions: ['.md'],
  type: 'html',
  transform: transformMarkdown
}

function transformMarkdown (string, context, done) {
  const attrs = fm.loadFront(string)
  const markup = marked(attrs.__content)
  if (attrs.layout == null) {
    done(null, markup)
    return
  }

  const filepath = path.resolve(path.dirname(context.abspath), attrs.layout)
  fs.promises.readFile(filepath, 'utf8').then(template =>
    posthtml(markdownPlugin(markup)).process(template)
  ).then(r => done(null, r.html), done)
}

function markdownPlugin (markup) {
  return tree => tree.walk(node => {
    if (node.tag === 'markdown') {
      return markup
    }

    return node
  })
}
