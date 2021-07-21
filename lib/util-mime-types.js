'use strict'

const path = require('path')

// based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types

const mimeTypes = {
  // default
  '': 'text/plain',
  // css files
  '.css': 'text/css',
  // html files
  '.html': 'text/html',
  // javascript files
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  // image files
  '.apng': 'image/apng',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.pjpeg': 'image/jpeg',
  '.pjp': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

function contentType (abspath) {
  const ext = path.extname(abspath)
  return mimeTypes[ext] ?? mimeTypes['']
}

module.exports = {
  contentType,
  mimeTypes
}
