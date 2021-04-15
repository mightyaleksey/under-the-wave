'use strict'

const { estimate } = require('./utils')

const h = {}
const m = new Map()

const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
keys.forEach((v, i) => {
  h[v] = i
  m.set(v, i)
})

estimate([
  function addToHash () {
    const hash = {}
    keys.forEach((v, i) => { hash[v] = i })
  },
  function addToMap () {
    const map = new Map()
    keys.forEach((v, i) => { map.set(v, i) })
  },
  function checkHash () {
    if (h.b != null) { /* */ }
    if (h.z != null) { /* */ }
  },
  function checkMap () {
    if (m.has('b')) { /* */ }
    if (m.has('z')) { /* */ }
  }
], 50000)
