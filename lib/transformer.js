'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { createEnv } = require('./transformer-utils')
const File = require('./file')

const $resolver = Symbol('resolver')
const $urlmapper = Symbol('urlmapper')

class Transformer {
  constructor ({ plugins, resolver, urlmapper }) {
    this[$resolver] = resolver
    this[$urlmapper] = urlmapper
    this.env = createEnv()
    this.plugins = plugins
  }

  async transform (file, options) {
    assert(file instanceof File, 'transform: file should be an instanceof File')

    const content = await fs.promises.readFile(file.path, 'utf8')

    const dependencies = new Set()
    const resolve = (abspath, file) => {
      const dpath = this[$resolver].resolveSync(abspath, file)
      dependencies.add(dpath)
      return this[$urlmapper].url(dpath)
    }

    const context = { env: this.env, type: options?.type ?? null }
    const plugin = this.plugins[path.extname(file.path)] ?? this.plugins['']
    file.content = await plugin.transform(
      content,
      file.path,
      resolve,
      context
    )

    return dependencies
  }
}

module.exports = Transformer
