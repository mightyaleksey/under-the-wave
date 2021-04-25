'use strict'

const assert = require('assert')
const path = require('path')

const { Asset } = require('./data-structures')
const { output } = require('./utils')

const asset = Symbol('asset')
const deps = Symbol('deps')
const log = Symbol('log')
const urlmap = Symbol('urlmap')
const protocol = /^[a-z]{2,6}:\/\//i

class Context {
  constructor (options, cmdOptions) {
    this.env = options.env
    this.settings = options.settings
    this[deps] = new Set()
    this[log] = options.log
    this[asset] = options.asset
    this[urlmap] = options.urlmap
  }

  get abspath () {
    return this[asset].path
  }

  get deps () {
    return this[deps]
  }

  get type () {
    return 'serve'
  }

  resolve (url) {
    if (protocol.test(url)) return url

    const abspath = this[urlmap].find(url, this[asset].path)
    if (abspath == null) {
      this[log].error('failed to resolver "%s" from "%s"', url, this[asset].path)
      return url
    }

    // track dependencies to save them later into cache
    this[deps].add(abspath)

    return this[urlmap].url(abspath, this[asset].path)
  }
}

class BuildContext extends Context {
  constructor (options, cmdOptions) {
    super(options, cmdOptions)
    assert(options.push != null)
    this.options = cmdOptions
    this.push = options.push
  }

  get type () {
    return 'build'
  }

  resolve (url) {
    if (protocol.test(url)) return url

    const abspath = this[urlmap].find(url, this[asset].path)
    if (abspath == null) {
      this[log].error('failed to resolver "%s" from "%s"', url, this[asset].path)
      return url
    }

    // track dependencies to save them later into cache
    this[deps].add(abspath)

    // output path can be changed on a build step
    const dasset = Asset.from(abspath)
    dasset.outputPath = output(dasset, this.options)

    this.push(dasset)

    return this[urlmap].url(dasset.outputPath, this[asset].outputPath)
  }
}

class TestContext extends Context {
  get type () {
    return 'test'
  }

  resolve (url) {
    if (protocol.test(url)) return url
    return path.resolve(path.dirname(this[asset].path), url)
  }
}

module.exports = {
  BuildContext,
  Context,
  TestContext
}
