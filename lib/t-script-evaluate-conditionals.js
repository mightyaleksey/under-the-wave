'use strict'

const { evaluateConditionalStatement } = require('./t-script-utils-evaluate')

function evaluateConditionalsScriptPlugin () {
  return {
    enter (node) {
      if (node.type === 'IfStatement') {
        const result = evaluateConditionalStatement(node.test)
        if (result === true && node.alternate != null) node.alternate = null
        if (result === false) return node.alternate
      }
    }
  }
}

module.exports = evaluateConditionalsScriptPlugin
