'use strict'

const assert = require('assert')
const path = require('path')

const { transformStream } = require('./streams')

const methods = ['parse', 'transform', 'stringify']

function * extnames (abspath) {
  assert(typeof abspath === 'string')
  const base = path.basename(abspath)
  const delimiter = '.'

  let index = base.indexOf(delimiter)
  while (index !== -1) {
    const extname = base.substring(index)
    yield extname

    index = base.indexOf(delimiter, index + 1)
  }
}

function createStreams (plugins, shared, asset) {
  const assetPlugins = filterPlugins(plugins, asset)

  for (const ext of extnames(asset.path)) {
    const list = assetPlugins.filter(p => p.extensions.includes(ext))
    if (list.length === 0) continue

    return list.reduce((t, p) => {
      methods.forEach(m => {
        if (p[m] != null) {
          t.push(transformStream(p[m], shared))
        }
      })

      return t
    }, [])
  }

  return []
}

function filterPlugins (plugins, asset) {
  return plugins.filter(p => p.type === asset.type)
}

module.exports = {
  extnames,
  createStreams,
  filterPlugins
}
