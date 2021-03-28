'use strict'

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

  constructor (data) {
    this.data = data
    this.next = null
  }

  * [Symbol.iterator] () {
    let item = this

    while (item != null) {
      yield item.data
      item = item.next
    }
  }
}

module.exports = {
  ListItem
}
