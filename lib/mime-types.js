'use strict'

// @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types

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

module.exports = mimeTypes
