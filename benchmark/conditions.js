'use strict'

const { estimate } = require('./utils')

const variants = {
  a: true,
  e: true,
  i: true,
  o: true,
  u: true,
  y: true
}

function withHash (letter) {
  if (variants[letter] != null) return variants[letter]
  return false
}

function withSwitchCase (letter) {
  switch (letter) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
    case 'y':
      return true
  }
  return false
}

function withIfStatement (letter) {
  if (
    letter === 'a' ||
    letter === 'e' ||
    letter === 'i' ||
    letter === 'o' ||
    letter === 'u' ||
    letter === 'y'
  ) return true
  return false
}

const letters = 'abcdefghijklmnopqrstuvwxyz'
const length = letters.length
function variant () {
  return letters.charAt(Math.random() * length >> 0)
}

estimate([
  function usingHash () {
    withHash(variant())
  },
  function usingSwitchCase () {
    withSwitchCase(variant())
  },
  function usingIfStatement () {
    withIfStatement(variant())
  }
], 50000)
