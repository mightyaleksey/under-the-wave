'use strict'

const assert = require('assert')
const { inspect } = require('util')

const { ILogger } = require('./util-logger-i')
const { Processing } = require('./core-processing')
const { Urlmap } = require('./core-urlmap')
const { extname } = require('./util-path')

const customInspect = inspect.custom ?? 'inspect'

class ProcessingFactory {
  constructor (options) {
    // mandatory for resolve
    assert(Array.isArray(options.plugins)) // properly validate plugins
    this.plugins = options.plugins
    this.product = options.product ?? Processing

    // required for processing
    this.filemap = options.filemap
    this.urlmap = options.urlmap ?? new Urlmap()
    this.cmd = options.cmd
    this.env = options.env
    this.settings = options.settings

    this.logger = options.logger ?? new ILogger()
  }

  resolve (url, referer) {
    assert(typeof url === 'string')
    assert(typeof referer === 'string')

    const ext = extname(url) ?? extname(referer)
    const matchingPlugins = this.plugins.filter(plugin => plugin.for === ext || plugin.for === '')

    for (let n = 0; n < matchingPlugins.length; ++n) {
      const plugin = matchingPlugins[n]

      this.urlmap.extensions = plugin.extensions
      const abspath = this.urlmap.map(url, referer)
      if (abspath == null) continue

      const plugins = [plugin]
      for (let k = n + 1; k < matchingPlugins.length; ++k) {
        const nextPlugin = matchingPlugins[k]
        if (nextPlugin.extensions.includes(ext)) plugins.push(nextPlugin)
      }

      const { product: Product, filemap, cmd, env, settings } = this
      const processingOptions = { url, abspath, plugins, filemap, cmd, env, settings }
      const processing = new Product(processingOptions, this)

      this.logger.debug({ url, referer, abspath }, 'url resolved')

      return processing
    }

    this.logger.debug({ url, referer }, 'url not resolved')

    return null
  }

  [customInspect] (depth, options) {
    const plugins = this.plugins.map(plugin => plugin.type)
    return `${this.constructor.name} → ${inspect(plugins, options)}`
  }
}

module.exports = {
  ProcessingFactory
}
