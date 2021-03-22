'use strict'

const pluginScript = require('./plugin-script')
const pluginStyle = require('./plugin-style')

function inlinedContent (abspath, resolve, context) {
  return (tree, cb) => {
    let tasks = 0
    tree.walk(node => {
      if (
        node.tag === 'script' &&
        node.content != null
      ) {
        tasks++

        const ctx = Object.create(context)
        ctx.type = node?.attrs?.type === 'module' ? 'module' : 'script'

        pluginScript.transform(node.content[0], abspath, resolve, ctx)
          .then(
            r => {
              tasks--
              node.content[0] = r
              if (tasks === 0) cb()
            },
            e => {
              tasks--
              if (tasks === 0) cb(e)
            }
          )
      }

      if (
        node.tag === 'style' &&
        node.content != null
      ) {
        tasks++
        pluginStyle.transform(node.content[0], abspath, resolve, context)
          .then(
            r => {
              tasks--
              node.content[0] = r
              if (tasks === 0) cb()
            },
            e => {
              tasks--
              if (tasks === 0) cb(e)
            }
          )
      }

      return node
    })

    if (tasks === 0) cb()
  }
}

module.exports = inlinedContent
