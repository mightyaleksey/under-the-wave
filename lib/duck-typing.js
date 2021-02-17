'use strict'

// "If it walks like a duck and it quacks like a duck, then it must be a duck"

const util = require('util')

class InterfaceType {
  constructor (name, ...props) {
    this.name = name
    this.props = new Map(props)
  }

  matches (target) {
    for (const [key, type] of this.props.entries()) {
      if (typeof target[key] !== type) { // eslint-disable-line valid-typeof
        const proto = Object.getPrototypeOf(target)
        const name = proto !== Object.prototype ? proto.constructor.name : null

        throw new Error(
          util.format(
            '%s should implement %s interface',
            (name != null ? name + ' ' : '') + '{...}',
            this.toString()
          )
        )
      }
    }
  }

  toString () {
    const keys = [...this.props.keys()].join(', ')
    return `${this.name} { ${keys} }`
  }
}

module.exports = {
  InterfaceType
}
