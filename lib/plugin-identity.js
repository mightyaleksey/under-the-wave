'use strict'

module.exports = {
  name: 'identity',
  async transform (content) {
    return content
  },
  async minify (content) {
    return content
  }
}
