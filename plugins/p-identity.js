'use strict'

module.exports = {
  extensions: [''],
  for: '',
  transform: identity,
  type: 'identity'
}

function identity (string, context, done) {
  // skipping identity plugin helps to avoid issues with encoding for binary files
  done(new Error('identity plugin should be skipped'))
}
