'use strict'

const assert = require('assert')
const http = require('http')
const path = require('path')

const Graph = require('./graph')
const Resolver = require('./resolver')
const Transformer = require('./transformer')
const UrlMapper = require('./url-mapper')

const { createHttpLogger } = require('./logger')
const { isfile } = require('./file-utils')
const mimeTypes = require('./mime-types')
const pluginIdentity = require('./plugin-identity')
const pluginMarkup = require('./plugin-markup')
const pluginScript = require('./plugin-script')
const pluginStyle = require('./plugin-style')

const logger = createHttpLogger()

async function cmdserve ({ port, wd }) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development'

  const graph = new Graph()
  const resolver = new Resolver()
  const urlmapper = new UrlMapper({ alias: true, base: wd })
  const transformer = new Transformer({
    plugins: {
      '.css': pluginStyle,
      '.html': pluginMarkup,
      '.js': pluginScript,
      '': pluginIdentity
    },
    resolver,
    urlmapper
  })

  http
    .createServer(async (req, res) => {
      logger(req, res)

      const pathname = req.url.split('?').shift()
      const fragment = pathname.endsWith('/') ? pathname + 'index.html' : pathname
      const abspath = urlmapper.file(fragment)

      if (abspath == null || !await isfile(abspath)) {
        res.writeHead(404)
        res.end()
        return
      }

      const file = graph.add(abspath)
      const transformStart = Date.now()
      await transformer.transform(file)
      const transformTime = Date.now() - transformStart
      assert(typeof file.content === 'string')
      res.writeHead(200, {
        'content-type': mimeTypes[path.extname(file.path)] ?? mimeTypes[''],
        'x-transform-time': `${transformTime}ms`
      })
      res.end(file.content)
      file.content = null
    })
    .listen(1234)
}

module.exports = cmdserve
