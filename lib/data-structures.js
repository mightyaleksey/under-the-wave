'use strict'

const assert = require('assert')
const { inspect } = require('util')

const { type } = require('./utils')

const customInspect = inspect.custom ?? 'inspect'

class Asset {
  static from (abspath, type) {
    return new Asset(abspath, type)
  }

  constructor (abspath, assetType) {
    assert(abspath != null)
    // "outputPath" is used on build step to store output path,
    // this one is necessary to properly resolve urls inside file
    // based on the new file location on the file system.
    this.outputPath = null
    this.path = abspath
    this.type = assetType ?? type(abspath)
  }

  [customInspect] (depth, options) {
    return `${this.constructor.name} → ${this.type} → ${inspect(this.path, options)}`
  }
}

class ListItem {
  static from (...args) {
    if (args.length === 0) {
      return null
    }

    const head = new ListItem(args[0])

    let item = head
    for (let i = 1; i < args.length; ++i) {
      item.next = new ListItem(args[i])
      item = item.next
    }

    return head
  }

  constructor (value) {
    this.next = null
    this.value = value
  }

  * [Symbol.iterator] () {
    let item = this

    while (item != null) {
      yield item.value
      item = item.next
    }
  }

  [customInspect] (depth, options) {
    return `${this.constructor.name} → ${inspect(this.value, options)}`
  }
}

module.exports = {
  Asset,
  ListItem
}
