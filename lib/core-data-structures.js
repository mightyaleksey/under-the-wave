'use strict'

const { inspect } = require('util')

const customInspect = inspect.custom ?? 'inspect'

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

  * values () {
    let item = this

    while (item != null) {
      yield item.value
      item = item.next
    }
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
  ListItem
}
