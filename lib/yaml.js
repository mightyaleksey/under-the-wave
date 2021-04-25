'use strict'

const { dump, load } = require('js-yaml')

// https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html

function parse (input) {
  return load(input)
}

function stringify (input) {
  return dump(input)
}

module.exports = {
  parse,
  stringify
}
