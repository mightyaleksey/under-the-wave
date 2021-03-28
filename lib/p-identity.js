'use strict'

module.exports = {
  name: 'identity',
  transform: transformIdentity
}

async function transformIdentity (abspath, content) {
  return content
}
