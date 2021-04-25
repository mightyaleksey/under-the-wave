'use strict'

function identifier (name) {
  return {
    type: 'Identifier',
    name: name
  }
}

function string (value) {
  return {
    type: 'StringLiteral',
    value: value
  }
}

function variableDeclaration (declarations = [], kind = 'var') {
  return {
    type: 'VariableDeclaration',
    declarations: declarations,
    kind: kind
  }
}

function variableDeclarator (id, init = null) {
  return {
    type: 'VariableDeclarator',
    id: id,
    init: init
  }
}

module.exports = {
  identifier,
  string,
  variableDeclaration,
  variableDeclarator
}
