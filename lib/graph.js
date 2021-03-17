'use strict'

const File = require('./file')

class Graph {
  constructor () {
    this.vertices = new Map()
  }

  add (abspath) {
    if (this.has(abspath)) return this.vertices.get(abspath)

    const file = new File(abspath)
    this.vertices.set(abspath, file)
    return file
  }

  get (abspath) {
    return this.vertices.get(abspath) ?? null
  }

  has (abspath) {
    return this.vertices.has(abspath)
  }
}

module.exports = Graph
