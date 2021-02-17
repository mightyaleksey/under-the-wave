'use strict'

const processed = Symbol('processed')

function fixFilePath ({ abspath, resolve }) {
  return {
    postcssPlugin: 'fix file path',

    // update @import
    AtRule (atrule) {
      if (atrule.name === 'import' && !atrule[processed]) {
        atrule.params = atrule.params.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (m, url) => {
          return m.replace(url, resolve(abspath, url))
        })
        atrule[processed] = true
      }
    },

    // update background, background-image
    Declaration (declaration) {
      if (
        ['background', 'background-image'].includes(declaration.prop) &&
        !declaration[processed]
      ) {
        declaration.value = declaration.value.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (m, url) => {
          return m.replace(url, resolve(abspath, url))
        })
        declaration[processed] = true
      }
    }
  }
}

module.exports = fixFilePath
module.exports.postcss = true
