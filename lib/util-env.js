'use strict'

const assert = require('assert')

// based on https://man7.org/linux/man-pages/man7/environ.7.html
const blocklist = [
  'EDITOR',
  'HOME',
  'LANG',
  'LOGNAME',
  'PAGER',
  'PATH',
  'PWD',
  'SHELL',
  'TERM',
  'USER',
  'VISUAL'
]

function createEnv () {
  return Object.keys(process.env).reduce((a, k) => {
    if (!blocklist.includes(k)) a[k] = process.env[k]
    return a
  }, {})
}

function createTestEnv (variables) {
  if (variables != null) {
    Object.values(variables).forEach(value => {
      assert(typeof value === 'string', 'Only string values can be used for environment variables')
    })
  }

  return Object.assign({ NODE_ENV: 'test' }, variables)
}

module.exports = {
  createEnv,
  createTestEnv
}
