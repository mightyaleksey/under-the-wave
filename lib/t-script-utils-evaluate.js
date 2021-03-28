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
      case 'Identifier':
        if (node.name === 'undefined') stack.push(undefined)
        else return noop
        break
      case 'Literal':
        stack.push(node.value)
        break
      case 'UnaryExpression':
        if (node.argument.type === 'UnaryExpression') {
          queue.push(node.argument.argument)
          queue.push(op('UnaryOperator', node.argument.operator))
          queue.push(op('UnaryOperator', node.operator))
        } else {
          queue.push(node.argument)
          queue.push(op('UnaryOperator', node.operator))
        }
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
