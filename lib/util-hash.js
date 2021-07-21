'use strict'

const sequence = 'abcdefghijklmnopqrstuvwxyz'

function abc (number) {
  let seq = ''
  let rest = number

  while (rest >= sequence.length) {
    seq = `${sequence.charAt(rest % sequence.length)}${seq}`
    rest = Math.floor(rest / sequence.length) - 1
  }

  return `${sequence.charAt(rest)}${seq}`
}

// Borrowing Ray Morgan's implementation:
// https://gist.github.com/raycmorgan/588423
// https://ru.wikipedia.org/wiki/MurmurHash2
function murmurHash (string, seed) {
  const m = 0x5bd1e995
  const r = 24
  let h = seed ^ string.length
  let length = string.length
  let currentIndex = 0

  while (length >= 4) {
    let k = UInt32(string, currentIndex)

    k = Umul32(k, m)
    k ^= k >>> r
    k = Umul32(k, m)

    h = Umul32(h, m)
    h ^= k

    currentIndex += 4
    length -= 4
  }

  switch (length) {
    case 3:
      h ^= UInt16(string, currentIndex)
      h ^= string.charCodeAt(currentIndex + 2) << 16
      h = Umul32(h, m)
      break

    case 2:
      h ^= UInt16(string, currentIndex)
      h = Umul32(h, m)
      break

    case 1:
      h ^= string.charCodeAt(currentIndex)
      h = Umul32(h, m)
      break
  }

  h ^= h >>> 13
  h = Umul32(h, m)
  h ^= h >>> 15

  return h >>> 0
}

function UInt32 (str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8) +
         (str.charCodeAt(pos++) << 16) +
         (str.charCodeAt(pos) << 24)
}

function UInt16 (str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8)
}

function Umul32 (n, m) {
  n = n | 0
  m = m | 0
  const nlo = n & 0xffff
  const nhi = n >>> 16
  const res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0
  return res
}

function hash (string) {
  if (string == null || string === '') return null
  return abc(murmurHash(string))
}

module.exports = {
  abc,
  hash
}
