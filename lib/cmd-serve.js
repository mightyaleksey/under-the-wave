'use strict'

const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const { finished, pipeline } = require('stream')

const { FilemapWithAliases } = require('./core-filemap-with-aliases')
const { ProcessingFactory } = require('./core-processing-factory')
const { ProcessingWithCache } = require('./core-processing-with-cache')
const { UrlmapWithAliases } = require('./core-urlmap-with-aliases')
const { abc } = require('./util-hash')
const { broadcast, createSocket } = require('./util-socket')
const { contentType } = require('./util-mime-types')
const { createEnv } = require('./util-env')
const { createServer } = require('./util-server')
const { debounce } = require('./util-scheduler')
const { isFile } = require('./util-fs')
const { loadCustomPlugins, loadPackageSettings } = require('./core-settings')
const { nodeModules } = require('./core-resolve')
const { scope } = require('./util-scope')

const corePlugins = [
  require('../plugins/p-markdown'),
  require('../plugins/p-markup'),
  require('../plugins/p-script'),
  require('../plugins/p-style'),
  // put identity in the end, since it is a generic plugin
  require('../plugins/p-identity')
]

async function serve (options, logger) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development'

  const env = createEnv()
  const wd = path.resolve(options['work-dir'])
  const packageScope = await scope(wd) ?? wd
  const settings = await loadPackageSettings(packageScope)
  const publicDirectory = path.join(packageScope, 'public')
  const innerPublicDirectory = path.resolve(__dirname, '../public')

  logger.debug('environment variables %o', env)
  logger.debug('package settings %o', settings)

  const port = isFinite(options.port) ? Number(options.port) : 1234
  const server = createServer(port, logger)

  const aliases = new Map()
  const cache = {}
  const fakeReferer = path.join(wd, '_') // points to imaginary file
  // prefill aliases with node_modules
  const modulesDirs = nodeModules(path.dirname(packageScope))
  if (modulesDirs != null) {
    for (const directory of modulesDirs) {
      const alias = `/~nm${abc(aliases.size)}`
      aliases.set(alias, directory)
    }
  }

  const plugins = loadCustomPlugins(settings.wave?.plugins, packageScope).concat(corePlugins)
  const filemap = new FilemapWithAliases({ aliases, packageScope, wd })
  const urlmap = new UrlmapWithAliases({ aliases }); urlmap.cache = cache
  const cmd = 'serve'

  const factoryOptions = { plugins, filemap, urlmap, cmd, env, settings, logger }
  if (options.cache) factoryOptions.product = ProcessingWithCache

  const processingFactory = new ProcessingFactory(factoryOptions)

  async function middleware (req, res) {
    const startTime = Date.now()

    let url = new URL(req.url, `http://localhost:${port}/`).pathname
    if (url.endsWith('/')) url += 'index.html'

    if (req.method !== 'GET') {
      res.writeHead(405, { allow: 'GET' })
      res.end()
      return
    }

    // serve project files and apply transformation if necessary
    const processing = processingFactory.resolve('.' + url, fakeReferer) // treat urls as relative paths
    if (processing != null) {
      res.writeHead(200, {
        'content-type': contentType(processing.url),
        'server-timing': [
          `plugins;desc="${processing.plugins.map(p => p.type).join(',')}"`,
          `routing;dur=${Date.now() - startTime}`
        ].join(', ')
      })

      const streams = await processing.transform()
      if (streams.length > 1) {
        pipeline(
          ...streams,
          err => {
            if (err != null) handleRequestError(err, res)
          }
        ).pipe(res)
      } else {
        finished(
          streams[0].pipe(res),
          err => {
            if (err != null) handleRequestError(err, res)
          }
        )
      }
      return
    }

    // serve files from "public" directory
    const publicFile = path.join(publicDirectory, url)
    if (await isFile(publicFile)) {
      res.writeHead(200, {
        'content-type': contentType(publicFile),
        'server-timing': [
          'publicFile',
          `routing;dur=${Date.now() - startTime}`
        ].join(', ')
      })

      finished(
        fs.createReadStream(publicFile).pipe(res),
        err => {
          if (err != null) handleRequestError(err, res)
        }
      )
      return
    }

    // serve development helpers from internal "public" directory
    if (url.startsWith('/~/')) {
      const innerFile = url.replace('/~', innerPublicDirectory)
      if (await isFile(innerFile)) {
        res.writeHead(200, {
          'content-type': contentType(innerFile),
          'server-timing': [
            'internalFile',
            `routing;dur=${Date.now() - startTime}`
          ].join(', ')
        })

        finished(
          fs.createReadStream(innerFile).pipe(res),
          err => {
            if (err != null) handleRequestError(err, res)
          }
        )
        return
      }
    }

    // nothing to serve
    res.writeHead(404, 'not found')
    res.end()
  }

  function handleRequest (req, res) {
    middleware(req, res).catch(err => handleRequestError(err, res))
  }

  function handleRequestError (err, res) {
    res.err = err
    res.writeHead(500, 'request errored')
    res.end()
  }

  server.on('request', handleRequest).on('upgrade', createSocket())

  function invalidate (abspath) {
    broadcast('reload')
  }

  const debouncedInvalidate = debounce(invalidate, 350)
  const ignored = [
    /node_modules/,
    path.join(packageScope, '.cache'),
    path.join(packageScope, 'dist')
  ]

  chokidar.watch(packageScope, { ignored: ignored })
    .on('change', debouncedInvalidate)
    .on('unlink', debouncedInvalidate)

  return server
}

module.exports = serve
