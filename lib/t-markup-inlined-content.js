'use strict'

const markupPlugin = require('./p-markup')

function inlinedContent (abspath, resolve, env) {
  return inlinedContentMarkupPlugin
  function inlinedContentMarkupPlugin (tree, cb) {
    let tasks = 0
    tree.walk(node => {
      if (
        node.tag === 'script' &&
        node.content != null
      ) {
        tasks++
        markupPlugin.transformMarkup(
          abspath,
          node.content[0],
          resolve,
          env,
          sourceType(node.attrs?.type)
        )
          .then(
            r => {
              node.content[0] = r
              if (--tasks === 0) cb()
            },
            e => {
              tasks = 0
              cb(e)
            }
          )
      }

      return node
    })

    if (tasks === 0) cb()
  }
}

module.exports = inlinedContent

function sourceType (type) {
  if (type === 'module') return 'module'
  return 'script'
}
