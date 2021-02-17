'use strict'

const { evaluateConditionalStatement } = require('./t-evaluate')

function unfoldCondition () {
  return {
    visitor: {
      IfStatement (path) {
        // test: specified condition
        // consequent: block of code to execute
        // alternate: else

        const result = evaluateConditionalStatement(path.get('test'))

        if (result === true && path.node.alternate != null) {
          path.get('alternate').remove()
        }

        if (result === false) {
          path.node.alternate != null
            ? path.replaceWith(path.get('alternate'))
            : path.remove()
        }
      }

      // SwitchStatement (path) { /* todo */ }
    }
  }
}

module.exports = unfoldCondition
