'use strict'

module.exports = {
  extensions: [''],
  for: '',
  transform: identity,
  type: 'identity'
}

function identity (string, context, done) {
  done(null, string)
}
