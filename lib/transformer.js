'use strict'

const assert = require('assert')
const path = require('path')

const { createEnv } = require('./transformer-utils')
const identityPlugin = require('./p-identity')

const protocol = /^[a-z]{2,6}:\/\//

class Transformer {
  constructor (corePlugins, userPlugins, resolver, urlmapper) {
    this.env = createEnv()
    this.corePlugins = corePlugins
    this.userPlugins = {}
    this.resolver = resolver
    this.urlmapper = urlmapper

    for (const plugin of userPlugins) {
      for (const ext of plugin.extensions) {
        assert(this.userPlugins[ext] == null)
        // validate plugins
        this.userPlugins[ext] = plugin
      }
    }
  }

  async transform (abspath, content, sourceType, log) {
    const ext = path.extname(abspath)
    const userPlugin = this.userPlugins[ext]
    const corePlugin = userPlugin != null
      ? this.corePlugins[userPlugin.alias]
      : this.corePlugins[ext]

    if (
      (userPlugin == null && corePlugin == null) ||
      (sourceType === ext && ext !== userPlugin?.alias)
    ) return content

    const resolve = (abspath, file) => {
      if (protocol.test(file)) return file
      const filepath = this.resolver.resolveModule(abspath, file)
      if (filepath == null) {
        log.error('failed to resolver "%s" from "%s"', file, abspath)
        return file
      }
      return this.urlmapper.url(filepath, abspath)
    }

    return (corePlugin ?? identityPlugin).transform(
      abspath,
      await (userPlugin ?? identityPlugin).transform(abspath, content),
      resolve,
      this.env,
      sourceType
    )
  }
}

module.exports = Transformer
