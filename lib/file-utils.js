'use strict'

const fs = require('fs')
const path = require('path')

function isdirsync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isDirectory()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function ftypesync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    if (stats.isFile()) return 'file'
    if (stats.isDirectory()) return 'directory'
    return null
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

async function isfile (abspath) {
  try {
    const stats = await fs.promises.stat(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

function isfilesync (abspath) {
  try {
    const stats = fs.statSync(abspath)
    return stats.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}

async function write (file, data, options) {
  try {
    await fs.promises.writeFile(file, data, options)
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.promises.mkdir(path.dirname(file), { recursive: true })
      await fs.promises.writeFile(file, data, options)
    } else {
      throw e
    }
  }
}

module.exports = {
  ftypesync,
  isdirsync,
  isfile,
  isfilesync,
  write
}
