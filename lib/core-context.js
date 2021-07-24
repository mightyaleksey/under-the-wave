'use strict'

const processing = Symbol('processing')

class Context {
  constructor (processingInstance) {
    this[processing] = processingInstance
  }

  get abspath () {
    return this[processing].abspath
  }

  get cmd () {
    return this[processing].cmd
  }

  get env () {
    return this[processing].env
  }

  get settings () {
    return this[processing].settings
  }

  request (url) {
    return this[processing].requestDependency(url)
  }

  resolve (url) {
    return this[processing].resolveDependency(url)
  }
}

module.exports = {
  Context
}
