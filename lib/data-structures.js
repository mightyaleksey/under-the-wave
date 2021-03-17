'use strict'

class ListItem {
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

class LRUCache {
  constructor (size) {
    this.map = new Map()
    this.size = size
  }

  get (key) {
    if (this.map.has(key)) {
      const value = this.map.get(key)
      this.map.delete(key)
      this.map.set(key, value)
      return value
    }

    return null
  }

  has (key) {
    return this.map.has(key)
  }

  set (key, value) {
    if (this.map.has(key)) this.map.delete(key)
    if (this.map.size > this.size) {
      const k = this.map.keys().next().value
      this.map.delete(k)
    }

    this.map.set(key, value)
  }
}

module.exports = {
  List,
  ListItem,
  LRUCache
}
