'use strict'

const assert = require('assert')

const { Urlmap } = require('./core-urlmap')
const { Processing } = require('./core-processing')
const { extname } = require('./util-path')

class ProcessingFactory {
  constructor (options) {
    assert(Array.isArray(options.plugins))
    this.plugins = options.plugins

    this.Product = Processing
    this.filemap = null
    this.urlmap = new Urlmap()

    this.cmd = null
    this.env = null
    this.settings = null
  }

  create (url, referer) {
    const ext = extname(url) ?? extname(referer)
    const matchingPlugins = this.plugins.filter(p => p.for === ext || p.for === '')

    for (let i = 0; i < matchingPlugins.length; i++) {
      const plugin = matchingPlugins[i]

      this.urlmap.extensions = plugin.extensions
      const abspath = this.urlmap.map(url, referer)
      if (abspath == null) continue

      const plugins = [plugin]
      for (let j = i + 1; j < matchingPlugins.length; j++) {
        const nextPlugin = matchingPlugins[j]
        if (nextPlugin.extensions.includes(ext)) plugins.push(nextPlugin)
      }

      const cmd = this.cmd
      const processing = new this.Product({ cmd, url, abspath, plugins }, this)
      processing.env = this.env
      processing.filemap = this.filemap
      processing.settings = this.settings

      return processing
    }

    return null
  }
}

module.exports = {
  ProcessingFactory
}
