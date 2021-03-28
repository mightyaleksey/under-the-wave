'use strict'

const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const { createLogger } = require('./logger')
const { createServer } = require('./server')
const { contentType, isfile, sourceType, splitPath } = require('./fs-utils')
const { getPluginAliases, mapPluginExtensions } = require('./utils')
const markupPlugin = require('./p-markup')
const scriptPlugin = require('./p-script')

const Graph = require('./graph')
const Resolver = require('./resolver')
const Transformer = require('./transformer')
const UrlMapper = require('./url-mapper')

const pathSuffixes = ['', 'index.html']

async function cmdserve (port, base, plugins) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development'
  base = path.resolve(base)

  const aliases = mapPluginExtensions(plugins)

  const graph = new Graph()
  const resolver = new Resolver()
  const urlmapper = new UrlMapper(
    base,
    dirname => resolver.nodeModules(dirname)
  )
  const transformer = new Transformer(
    {
      '.html': markupPlugin,
      '.js': scriptPlugin
    },
    plugins,
    resolver,
    urlmapper
  )

  async function middleware (req, res) {
    const url = new URL(req.url, `http://localhost:${port}/`)

    // check in graph
    for (const suffix of pathSuffixes) {
      const pathname = url.pathname + suffix
      if (!graph.has(pathname)) continue

      const file = graph.get(pathname)
      res.writeHead(200, {
        'content-type': contentType(pathname),
        'x-origin': 'memory'
      })
      res.end(file.content)
      return
    }

    // resolve as file
    for (const suffix of pathSuffixes) {
      const [filename, extension] = splitPath(urlmapper.file(url.pathname) + suffix)
      for (const ext of getPluginAliases(extension, aliases)) { // pick based on plugins
        const abspath = filename + ext
        if (!await isfile(abspath)) continue

        const pathname = url.pathname + suffix
        const file = graph.add(pathname, abspath)

        const transformStart = Date.now()
        file.content = await transformer.transform(
          abspath,
          await fs.promises.readFile(abspath, 'utf8'),
          sourceType(url),
          req.log
        )
        const transformTime = Date.now() - transformStart

        res.writeHead(200, {
          'content-type': contentType(file.url),
          'x-origin': 'file',
          'x-transform-time': transformTime + 'ms'
        })
        res.end(file.content)
        return
      }
    }

    res.writeHead(404)
    res.end()
  }

  function exec (req, res) {
    middleware(req, res).catch(err => {
      res.err = err
      res.writeHead(500)
      res.end()
    })
  }

  const logger = createLogger({ pretty: true })
  createServer(logger, port).on('request', exec)

  function invalidate (abspath) {
    // with url transformation we can optimize it to O(1) from O(n)
    for (const [pathname, file] of graph.vertices) {
      if (abspath === file.path) {
        graph.vertices.delete(pathname)
        break
      }
    }
  }

  chokidar.watch(base, { ignored: /node_modules/ })
    .on('change', invalidate)
    .on('unlink', invalidate)
}

module.exports = cmdserve
