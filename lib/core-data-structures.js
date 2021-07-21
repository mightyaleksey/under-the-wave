'use strict'

const assert = require('assert')
const path = require('path')
const { inspect } = require('util')

const customInspect = inspect.custom ?? 'inspect'

class Asset {
  static from (abspath, type) {
    return new Asset(abspath, type)
  }

  static type (abspath) {
    const type = path.extname(abspath).substring(1)
    return type !== '' ? type : null
  }

  constructor (abspath, type) {
    assert(abspath != null)
    // "outputPath" is used on build step to store output path,
    // this one is necessary to properly resolve urls inside file
    // based on the new file location on the file system.
    this.outputPath = null
    this.path = abspath
    this.type = type ?? Asset.type(abspath)
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
    let output = this.constructor.name
    let item = this
    while (item != null) {
      output += ` → ${inspect(item.value, options)}`
      item = item.next
    }

    return output
  }
}

module.exports = {
  Asset,
  ListItem
}
