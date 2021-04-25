'use strict'

const fs = require('fs')

function isDirSync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isDirectory()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function isFileSync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

async function isFile (abspath) {
  try {
    const stats = await fs.promises.stat(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function mkdir (dirpath) {
  return fs.promises.mkdir(dirpath, { recursive: true })
}

function stats (abspath) {
  return fs.promises.stat(abspath).catch(err => {
    if (err.code === 'ENOENT') return null
    throw err
  })
}

module.exports = {
  isDirSync,
  isFile,
  isFileSync,
  mkdir,
  stats
}
