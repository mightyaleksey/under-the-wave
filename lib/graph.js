'use strict'

const File = require('./file')

class Graph {
  constructor () {
    this.vertices = new Map()
  }

  add (pathname, abspath) {
    if (this.has(pathname)) return this.get(pathname)

    const file = new File(pathname, abspath)
    this.vertices.set(pathname, file)
    return file
  }

  get (pathname) {
    return this.vertices.get(pathname) ?? null
  }

  has (pathname) {
    return this.vertices.has(pathname)
  }
}

module.exports = Graph
