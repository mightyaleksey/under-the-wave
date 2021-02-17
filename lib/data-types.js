'use strict'

class ListItem {
  constructor (data) {
    this.data = data
    this.next = null
  }
}

const $head = Symbol('head')
const $tail = Symbol('tail')

class List {
  constructor (...args) {
    this[$head] = null
    this[$tail] = null
    this.size = 0

    args.forEach(a => this.push(a))
  }

  pop () {
    if (this[$head] == null) {
      return null
    }

    const item = this[$head]
    this[$head] = item.next
    if (this[$head] == null) this[$tail] = null
    this.size--

    return item.data
  }

  push (data) {
    const item = new ListItem(data)

    if (this[$head] == null) {
      this[$head] = item
    } else {
      this[$tail].next = item
    }

    this[$tail] = item
    this.size++

    return this
  }

  * queue () {
    while (this[$head] != null) {
      const item = this[$head]
      this[$head] = this[$head].next

      if (this[$head] == null) {
        this[$tail] = null
      }

      this.size--
      yield item.data

      item.data = null
      item.next = null
    }
  }

  * values () {
    let item = this[$head]

    while (item != null) {
      yield item.data
      item = item.next
    }
  }

  [Symbol.iterator] () {
    return this.values()
  }
}

module.exports = {
  ListItem,
  List
}
