'use strict'

const assert = require('assert')
const path = require('path')

function * basenames (abspath) {
  assert(typeof abspath === 'string')
  const baseStart = abspath.lastIndexOf(path.sep)
  let extStart = abspath.indexOf('.', Math.max(baseStart, 0))

  while (extStart > -1) {
    yield abspath.substring(0, extStart)
    extStart = abspath.indexOf('.', extStart + 1)
  }

  yield abspath
}

function extname (abspath, getFullExtension) {
  assert(typeof abspath === 'string')
  const baseStart = abspath.lastIndexOf(path.sep)
  const extStart = getFullExtension === true
    ? abspath.indexOf('.', Math.max(baseStart, 0))
    : abspath.lastIndexOf('.')

  return extStart > baseStart ? abspath.substring(extStart) : null
}

/**
 * turns "../lib/foo" → "foo"
 *
 * @param {string} fragmentPath
 * @returns
 */
function foldLevels (fragmentPath) {
  assert(typeof fragmentPath === 'string')
  const parentDir = `..${path.sep}`

  let levels = 0
  let index = fragmentPath.indexOf(parentDir, 0)
  while (index > -1) {
    levels++
    index = fragmentPath.indexOf(parentDir, index + 1)
  }

  const result = fragmentPath.substring(levels * parentDir.length)

  index = 0
  while (levels > 0) {
    levels--
    index = result.indexOf(path.sep, index + 1)
  }

  return index === 0 ? result : result.substring(index + 1)
}

module.exports = {
  basenames,
  extname,
  foldLevels
}
