'use strict'

const _sequence = 'abcdefghijklmnopqrstuvwxyz'

function abc (digit) {
  let seq = ''
  let rest = digit

  while (rest >= _sequence.length) {
    seq = `${_sequence.charAt(rest % _sequence.length)}${seq}`
    rest = Math.floor(rest / _sequence.length) - 1
  }

  return `${_sequence.charAt(rest)}${seq}`
}

function addParam (urlstring, k, v) {
  const index = urlstring.lastIndexOf('?')
  if (index === -1) return `${urlstring}?${k}=${v}`

  const searchParams = new URLSearchParams(urlstring.substring(index + 1))
  searchParams.set(k, v)

  return urlstring.substring(0, index) + '?' + searchParams.toString()
}

function makeRelative (src) {
  if (
    src.startsWith('../') ||
    src.startsWith('./') ||
    src.startsWith('/')
  ) {
    return src
  }

  return './' + src
}

function moduletype (urlstring) {
  const base = 'http://localhost/'
  const url = new URL(urlstring, base)
  if (url.pathname.endsWith('.mjs')) {
    return 'module'
  }

  if (url.pathname.endsWith('.js')) {
    if (url.searchParams.get('t') === 'm') return 'module'
    return 'script'
  }

  return null
}

function normalize (rpath) {
  return '/' + rpath
}

module.exports = {
  abc,
  addParam,
  makeRelative,
  moduletype,
  normalize
}
