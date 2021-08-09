'use strict'

const fm = require('yaml-front-matter')
const hl = require('highlight.js')
const marked = require('marked')
const posthtml = require('posthtml')

const { Renderer } = require('./p-markdown-utils-renderer')

module.exports = {
  extensions: ['.md'],
  for: '.html',
  transform: transformMarkdownPlugin,
  type: 'markdown'
}

function transformMarkdownPlugin (string, context, done) {
  const meta = fm.loadFront(string)
  if (meta.layout == null) {
    const markup = marked(meta.__content)
    done(null, markup)
    return
  }

  const file = context.request(meta.layout)
  if (file == null) {
    done(new Error('request failed for "' + meta.layout + '"'))
    return
  }

  file.then(buffer => {
    const template = buffer.toString('utf8')
    // keep in mind that matching html plugins will be applied one more time after,
    // thus some plugins may be applied twice
    return posthtml(markdownPlugin(meta.__content)).process(template)
  })
    .then(result => done(null, result.html), done)
}

function markdownPlugin (content) {
  return tree => tree.walk(node => {
    if (node.tag === 'markdown') {
      const options = { highlight: highlightCode, renderer: new Renderer(node.attrs) }
      return marked(content, options)
    }

    return node
  })
}

function highlightCode (code, lang) {
  const language = hl.getLanguage(lang) ? lang : 'plaintext'
  const output = hl.highlight(code, { language }).value
  return output
}
