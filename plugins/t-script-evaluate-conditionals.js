'use strict'

const { evaluateConditionalStatement } = require('./t-script-utils-evaluate')

function evaluateConditionalsScriptPlugin () {
  return {
    visitor: {
      IfStatement: {
        enter (path) {
          const result = evaluateConditionalStatement(path.node.test)
          if (result === true && path.node.alternate != null) path.get('alternate').remove()
          if (result === false) {
            path.node.alternate != null
              ? path.replaceWith(path.get('alternate'))
              : path.remove()
          }
        }
      }
    }
  }
}

module.exports = evaluateConditionalsScriptPlugin
