'use strict'

const babel = require('@babel/core')
const csstree = require('css-tree')
const http = require('http')
const posthtml = require('posthtml')

const { createTestEnv } = require('../lib/util-env')

function curl (port, message) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: `/${encodeURIComponent(message)}`,
    method: 'GET',
    headers: {}
  }

  const req = http.request(options)

  req.end()

  return new Promise(resolve => req.once('close', resolve))
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class TestContext {
  constructor (options) {
    this.abspath = options.abspath ?? '/www/index.html'
    this.env = createTestEnv(options.env)
    this.settings = { scope: '/www' }
    this.type = 'test'
  }

  request (url) {
    return new Promise(resolve => resolve(''))
  }

  resolve (url) {
    if (url.startsWith('./')) url = url.replace('.', '')
    return url
  }
}

function createTestContext (abspath, env) {
  return new TestContext({ abspath, env })
}

async function transformMarkup (string, plugins) {
  if (plugins != null && !Array.isArray(plugins)) plugins = [plugins]
  return posthtml(plugins).process(string).then(r => r.html)
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
  curl,
  delay,
  createTestContext,
  transformMarkup,
  transformScript,
  transformStyle
}
