'use strict'

const babel = require('@babel/core')
const csstree = require('css-tree')
const posthtml = require('posthtml')
const path = require('path')

const { Asset } = require('../lib/data-structures')
const { TestContext } = require('../lib/shared')
const { createTestEnv } = require('../lib/environment')

function createContext (abspath, customEnv) {
  const asset = Asset.from(abspath ?? '/app.js')
  const env = createTestEnv(customEnv)

  return new TestContext({ asset, env })
}

function createUrlMap (wd) {
  if (wd == null) wd = '/'
  return {
    find (url, referrer) {
      return path.join(wd, url)
    },

    url (abspath, referrer) {
      return '/' + path.relative(wd, abspath)
    }
  }
}

async function transformMarkup (string, plugins) {
  if (plugins != null && !Array.isArray(plugins)) plugins = [plugins]
  return (await posthtml(plugins).process(string)).html
}

async function transformScript (string, plugins) {
  if (plugins != null && !Array.isArray(plugins)) plugins = [plugins]
  return babel.transformSync(string, { plugins: plugins }).code
}

async function transformStyle (string, plugin) {
  const ast = csstree.parse(string)
  csstree.walk(ast, plugin)
  return csstree.generate(ast)
}

module.exports = {
  createContext,
  createUrlMap,
  transformMarkup,
  transformScript,
  transformStyle
}
