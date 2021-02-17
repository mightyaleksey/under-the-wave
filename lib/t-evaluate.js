'use strict'

const { List } = require('./data-types')

const noop = Symbol('noop')

function evaluateConditionalStatement (path) {
  const result = evaluateCheaply(path.node)
  if (result === noop) return null
  return Boolean(result)
}

function evaluateCheaply (start) {
  const list = new List(start)
  const stack = new List()

  for (const node of list.queue()) {
    switch (node.type) {
      case 'BinaryExpression':
      case 'LogicalExpression':
        list.push(node.left)
        list.push(node.right)
        list.push(op('BinaryOperator', node.operator))
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
      case 'Identifier': {
        if (node.name === 'undefined') stack.push(undefined)
        else return noop
        break
      }
      case 'NullLiteral':
        stack.push(null)
        break
      case 'UnaryExpression':
        list.push(node.argument)
        list.push(op('UnaryOperator', node.operator))
        break
      case 'UnaryOperator': {
        const argument = stack.pop()
        switch (node.operator) {
          case '!!': stack.push(!!argument); break
          case '!': stack.push(!argument); break
          default: return noop
        }
        break
      }
      default:
        return noop
    }
  }

  return stack.pop()
}

function evaluate (start) {
  const list = new List(start)
  const stack = new List()

  for (const node of list.queue()) {
    switch (node.type) {
      case 'AssignmentExpression':
        list.push(node.right)
        break
      case 'BinaryExpression':
      case 'LogicalExpression':
        list.push(node.left)
        list.push(node.right)
        list.push(op('BinaryOperator', node.operator))
        break
      case 'BinaryOperator': {
        const left = stack.pop()
        const right = stack.pop()
        switch (node.operator) {
          case '-': stack.push(left - right); break
          case '!=': stack.push(left != right); break // eslint-disable-line eqeqeq
          case '!==': stack.push(left !== right); break
          case '*': stack.push(left * right); break
          case '**': stack.push(left ** right); break
          case '/': stack.push(left / right); break
          case '&': stack.push(left & right); break
          case '&&': stack.push(left && right); break
          case '+': stack.push(left + right); break
          case '<': stack.push(left < right); break
          case '<=': stack.push(left <= right); break
          case '==': stack.push(left == right); break // eslint-disable-line eqeqeq
          case '===': stack.push(left === right); break
          case '>': stack.push(left > right); break
          case '>=': stack.push(left >= right); break
          case '|': stack.push(left | right); break
          case '||': stack.push(left || right); break
          default: return new Error('Unknown binary expression operator ' + node.operator)
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
        else return new Error('Unknown node type' + node.type)
        break
      case 'NullLiteral':
        stack.push(null)
        break
      case 'UnaryExpression':
        list.push(node.argument)
        list.push(op('UnaryOperator', node.operator))
        break
      case 'UnaryOperator': {
        const argument = stack.pop()
        switch (node.operator) {
          case '-': stack.push(-argument); break
          case '!!': stack.push(!!argument); break
          case '!': stack.push(!argument); break
          case '+': stack.push(+argument); break
          case 'typeof': stack.push(typeof argument); break
          default: return new Error('Unknown unary expression operator ' + node.operator)
        }
        break
      }
      default:
        return new Error('Unknown node type' + node.type)
    }
  }

  return stack.pop()
}

module.exports = {
  evaluateConditionalStatement,
  evaluateCheaply,
  evaluate
}

function op (type, operator) {
  return { type, operator }
}
