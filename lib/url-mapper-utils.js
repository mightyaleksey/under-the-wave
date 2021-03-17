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

function normalize (rpath) {
  return '/' + rpath
}

module.exports = {
  abc,
  normalize
}
