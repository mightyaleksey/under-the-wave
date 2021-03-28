'use strict'

class File {
  constructor (pathname, abspath) {
    this.url = pathname
    this.path = abspath
    this.content = ''
  }
}

module.exports = File
