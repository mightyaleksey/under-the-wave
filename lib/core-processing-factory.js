'use strict'

const assert = require('assert')
const { inspect } = require('util')

const { ILogger } = require('./util-logger-i')
const { IUrlmap } = require('./core-urlmap-i')
const { Processing } = require('./core-processing')
const { extname } = require('./util-path')

const customInspect = inspect.custom ?? 'inspect'

class ProcessingFactory {
  static validatePlugin (plugin) {
    assert(typeof plugin.type === 'string' && plugin.type.length > 0)
    if (!Array.isArray(plugin.extensions)) throw new Error(`plugin "${plugin.type}": "extensions" should be an array of file extensions that can be used as input`)
    if (typeof plugin.for !== 'string') throw new Error(`plugin "${plugin.type}": "for" should be an extension for an output file`)
    if (typeof plugin.transform !== 'function') throw new Error(`plugin "${plugin.type}": "transform" should be a function`)

    if (plugin.type !== 'identity') {
      assert(plugin.extensions.every(ext => ext !== ''))
      assert(plugin.for !== '')
    }
  }

  constructor (options) {
    // mandatory for resolve
    assert(Array.isArray(options.plugins))
    for (const plugin of options.plugins) ProcessingFactory.validatePlugin(plugin)
    this.plugins = options.plugins
    this.product = options.product ?? Processing

    // required for processing
    this.filemap = options.filemap
    this.urlmap = options.urlmap ?? new IUrlmap()
    this.cmd = options.cmd
    this.env = options.env
    this.settings = options.settings

    this.logger = options.logger ?? new ILogger()
  }

  resolve (url, referer) {
    assert(typeof url === 'string')
    assert(typeof referer === 'string')

    if (url.endsWith('/')) url += 'index.html'

    const ext = extname(url) ?? extname(referer)
    const matchingPlugins = this.plugins.filter(plugin => plugin.for === ext || plugin.for === '')

    for (let n = 0; n < matchingPlugins.length; ++n) {
      const plugin = matchingPlugins[n]

      this.urlmap.extensions = plugin.extensions
      const abspath = this.urlmap.map(url, referer)
      if (abspath == null) continue

      // first plugin that may apply custom transformation,
      // for example ".md" → ".html"
      const plugins = [plugin]
      // other plugins that can be applied after,
      // should have a matching extension among "extensions".
      for (let k = n + 1; k < matchingPlugins.length; ++k) {
        const nextPlugin = matchingPlugins[k]
        if (nextPlugin.extensions.includes(ext)) plugins.push(nextPlugin)
      }

      const { product: Product, filemap, cmd, env, settings } = this
      const processingOptions = { url, abspath, plugins, filemap, cmd, env, settings }
      const processing = new Product(processingOptions, this)

      this.logger.debug('resolve completed %o', { url, referer, abspath })

      return processing
    }

    this.logger.debug('resolve errored %o', { url, referer })

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
