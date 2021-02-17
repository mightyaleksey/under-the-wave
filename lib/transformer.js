'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { createEnv } = require('./transformer-utils')
const { interfaceResolver, interfaceUrlMapper } = require('./types')
const File = require('./file')

const $resolver = Symbol('resolver')
const $urlmapper = Symbol('urlmapper')

class Transformer {
  constructor ({ plugins, resolver, urlmapper }) {
    interfaceResolver.matches(resolver)
    interfaceUrlMapper.matches(urlmapper)

    this[$resolver] = resolver
    this[$urlmapper] = urlmapper
    this.context = { env: createEnv() }
    this.plugins = plugins
  }

  async transform (file) {
    assert(file instanceof File, 'transform: file should be an instanceof File')

    const content = await fs.promises.readFile(file.path, 'utf8')

    const dependencies = new Set()
    const resolve = (abspath, file) => {
      const dpath = this[$resolver].resolveSync(abspath, file)
      dependencies.add(dpath)
      return this[$urlmapper].url(dpath)
    }

    const plugin = this.plugins[path.extname(file.path)] ?? this.plugins['']
    file.content = await plugin.transform(content, file.path, resolve, this.context)

    return dependencies
  }
}

module.exports = Transformer
