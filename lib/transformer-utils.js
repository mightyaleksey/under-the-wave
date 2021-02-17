'use strict'

// based on https://man7.org/linux/man-pages/man7/environ.7.html
const envBlockList = [
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
    if (!envBlockList.includes(k)) a[k] = process.env[k]
    return a
  }, {})
}

module.exports = {
  createEnv
}
