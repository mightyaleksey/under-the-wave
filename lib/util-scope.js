'use strict'

const path = require('path')

const { isFile } = require('./util-fs')

/**
 * Finds package scope by checking if current and root directories contain "package.json" file.
 *
 * @param {string} directory
 * @returns directory or null if not found
 */
async function packageScope (directory) {
  let cursor = { dir: directory, root: undefined }

  while (cursor.dir !== cursor.root) {
    const abspath = path.join(cursor.dir, 'package.json')
    if (await isFile(abspath)) return cursor.dir

    cursor = path.parse(cursor.dir)
  }

  return null
}

module.exports = {
  packageScope
}
