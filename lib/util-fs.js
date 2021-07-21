'use strict'

const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

async function copy (sourceDir, outputDir) {
  const filenames = await fs.promises.readdir(sourceDir)
  if (filenames.length === 0) return

  await mkdir(outputDir)

  return Promise.all(
    filenames.map(async (filename) => {
      const abspath = path.join(sourceDir, filename)
      if (!await isFile(abspath)) return // todo support recursive copy

      return pipeline(
        fs.createReadStream(abspath),
        fs.createWriteStream(path.join(outputDir, filename))
      )
    })
  )
}

function isDirectorySync (abspath) {
  try {
    return fs.statSync(abspath).isDirectory()
  } catch (err) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}

function isFile (abspath) {
  return fs.promises.stat(abspath)
    .then(
      stats => stats.isFile(),
      err => {
        if (['ENOTDIR', 'ENOENT'].includes(err.code)) return false
        throw err
      }
    )
}

function isFileSync (abspath) {
  try {
    return fs.statSync(abspath).isFile()
  } catch (err) {
    if (['ENOTDIR', 'ENOENT'].includes(err.code)) return false
    throw err
  }
}

function mkdir (directory) {
  return fs.promises.mkdir(directory, { recursive: true })
}

function requireJson (abspath) {
  try {
    const string = fs.readFileSync(abspath, 'utf8')
    return JSON.parse(string)
  } catch (err) {
    if (['ENOTDIR', 'ENOENT'].includes(err.code)) return null
    throw err
  }
}

module.exports = {
  copy,
  isDirectorySync,
  isFile,
  isFileSync,
  mkdir,
  requireJson
}
