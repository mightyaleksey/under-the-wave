'use strict'

const File = require('./file')

class Graph {
  constructor () {
    this.vertices = new Map()
  }

  add (abspath) {
    if (this.vertices.has(abspath)) return this.vertices.get(abspath)

    const file = new File(abspath)
    this.vertices.set(abspath, file)
    return file
  }
}

module.exports = Graph
