'use strict'

const assert = require('assert')
const chokidar = require('chokidar')
const path = require('path')

const Graph = require('./graph')
const Resolver = require('./resolver')
const Transformer = require('./transformer')
const UrlMapper = require('./url-mapper')

const { createLogger } = require('./logger')
const { createServer } = require('./server')
const { isfile } = require('./file-utils')
const { moduletype } = require('./url-mapper-utils')
const mimeTypes = require('./mime-types')
const pluginIdentity = require('./plugin-identity')
const pluginMarkup = require('./plugin-markup')
const pluginScript = require('./plugin-script')
const pluginStyle = require('./plugin-style')

const logger = createLogger({ pretty: true })

async function cmdserve ({ port, wd }) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development'

  const graph = new Graph()
  const resolver = new Resolver()
  const urlmapper = new UrlMapper({
    alias: true,
    base: wd,
    nodeModules: dirname => resolver.nodeModules(dirname)
  })
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

  createServer(logger, port).on('request', async (req, res) => {
    const pathname = req.url.split('?').shift()
    const fragment = pathname.endsWith('/') ? pathname + 'index.html' : pathname
    const abspath = urlmapper.file(fragment)

    if (abspath == null || !await isfile(abspath)) {
      res.writeHead(404)
      res.end()
      return
    }

    const file = graph.add(abspath)
    const headers = { 'content-type': mimeTypes[path.extname(file.path)] ?? mimeTypes[''] }

    if (file.content == null) {
      const transformStart = Date.now()
      await transformer.transform(file, { type: moduletype(req.url) }, req.log)
      const transformTime = Date.now() - transformStart
      assert(typeof file.content === 'string')
      headers['x-transform-time'] = `${transformTime}ms`
    }

    res.writeHead(200, headers)
    res.end(file.content)
  })

  function updateContent (abspath) {
    const file = graph.get(abspath)
    if (file != null) file.content = null
  }
  chokidar.watch(wd, { ignored: /node_modules/ })
    .on('change', updateContent)
    .on('unlink', updateContent)
}

module.exports = cmdserve
