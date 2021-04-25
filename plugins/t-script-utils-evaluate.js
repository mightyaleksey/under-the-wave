'use strict'

const noop = Symbol('noop')

function evaluateConditionalStatement (node) {
  const result = evaluateSimply(node)
  if (result === noop) return null
  return Boolean(result)
}

function evaluateSimply (statement) {
  const stack = []
  const queue = [statement]
  while (queue.length > 0) {
    const node = queue.shift()
    switch (node.type) {
      case 'BinaryExpression':
      case 'LogicalExpression':
        queue.push(node.left)
        queue.push(node.right)
        queue.push(op('BinaryOperator', node.operator))
        break
      case 'BinaryOperator': {
        const left = stack.pop()
        const right = stack.pop()
        switch (node.operator) {
          case '!=': stack.push(left != right); break // eslint-disable-line eqeqeq
          case '!==': stack.push(left !== right); break
          case '&&': stack.push(left && right); break
          case '==': stack.push(left == right); break // eslint-disable-line eqeqeq
          case '===': stack.push(left === right); break
          case '||': stack.push(left || right); break
          default: return noop
        }
        break
      }
      case 'BooleanLiteral':
      case 'NumericLiteral':
      case 'StringLiteral':
        stack.push(node.value)
        break
      case 'Identifier':
        if (node.name === 'undefined') stack.push(undefined)
        else return noop
        break
      case 'NullLiteral':
        stack.push(null)
        break
      case 'UnaryExpression':
        if (queue[0]?.type === 'UnaryOperator') {
          queue.unshift(op('UnaryOperator', node.operator))
          queue.unshift(node.argument)
          break
        }
        queue.push(node.argument)
        queue.push(op('UnaryOperator', node.operator))
        break
      case 'UnaryOperator': {
        const argument = stack.pop()
        switch (node.operator) {
          case '!': stack.push(!argument); break
          default: return noop
        }
        break
      }
      default:
        return noop
    }
  }
  if (stack.length !== 1) {
    console.log(statement)
    throw new Error('incorrect state')
  }
  return stack.pop()
}

module.exports = {
  evaluateConditionalStatement
}

function op (type, operator) {
  return { type, operator }
}
