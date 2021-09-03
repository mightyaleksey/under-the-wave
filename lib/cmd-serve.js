'use strict'

const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const { finished } = require('stream/promises')

const { Filemap } = require('./core-filemap-serve')
const { ListItem } = require('./core-data-structures')
const { ProcessingFactory } = require('./core-processing-factory')
const { ProcessingWithCache } = require('./core-processing-with-cache')
const { Urlmap } = require('./core-urlmap')
const { abc } = require('./util-hash')
const { broadcast, createSocket } = require('./util-socket')
const { contentType } = require('./util-mime-types')
const { createEnv } = require('./util-env')
const { createServer } = require('./util-server')
const { debounce } = require('./util-scheduler')
const { isFile } = require('./util-fs')
const { loadCustomPlugins, loadPackageSettings } = require('./core-settings')
const { nodeModules } = require('./core-resolve')
const { packageScope } = require('./util-scope')

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
  const workdir = path.resolve(options['work-dir'])
  const scopedir = await packageScope(workdir) ?? workdir
  const settings = await loadPackageSettings(scopedir)
  const publicdir = path.join(scopedir, 'public')
  const internaldir = path.resolve(__dirname, '../public')
  let fallback = ''

  logger.debug('environment variables %o', env)
  logger.debug('package settings %o', settings)

  const port = isFinite(options.port) ? Number(options.port) : 1234
  const server = createServer(port, logger)

  const aliases = new Map()
  const cache = {}
  const fakeReferer = path.join(workdir, '_') // points to imaginary file
  // prefill aliases with node_modules
  const modulesDirs = nodeModules(path.dirname(scopedir))
  if (modulesDirs != null) {
    for (const directory of modulesDirs) {
      const alias = `~nm${abc(aliases.size)}`
      aliases.set(alias, directory)
    }
  }

  const plugins = loadCustomPlugins(settings.wave?.plugins, scopedir).concat(corePlugins)
  const directories = ListItem.from(scopedir, workdir, publicdir)
  const filemap = new Filemap({ aliases, directories })
  const urlmap = new Urlmap({ aliases, directories }); urlmap.cache = cache
  const cmd = 'serve'

  const factoryOptions = { plugins, filemap, urlmap, cmd, env, settings, logger }
  if (options.cache) factoryOptions.product = ProcessingWithCache

  const processingFactory = new ProcessingFactory(factoryOptions)

  async function middleware (req, res) {
    const startTime = Date.now()

    const url = req.pathname = new URL(req.url, `http://localhost:${port}/`).pathname

    if (req.method !== 'GET') {
      res.writeHead(405, { allow: 'GET' })
      res.end()
      return
    }

    if (url.startsWith('/-internal-/')) {
      const internalFile = path.join(internaldir, url.substring(12))
      if (await isFile(internalFile)) {
        res.writeHead(200, {
          'content-type': contentType(internalFile),
          'server-timing': [
            'internalFile',
            `routing;dur=${Date.now() - startTime}`
          ].join(', ')
        })

        const rs = fs.createReadStream(internalFile)
        rs.pipe(res)

        await finished(rs)
      } else {
        // nothing to serve
        res.writeHead(404, 'not found')
        res.end()
      }

      return
    }

    // serve project files and apply transformation if necessary
    const processing = processingFactory.resolve(url, fakeReferer) // treat urls as relative paths
    if (processing != null) {
      res.writeHead(200, {
        'content-type': contentType(processing.url),
        'server-timing': [
          `plugins;desc="${processing.plugins.map(p => p.type).join(',')}"`,
          `routing;dur=${Date.now() - startTime}`
        ].join(', ')
      })

      await processing.transform(res)
      return
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
    if (res.req.pathname.endsWith('/')) res.end(fallback)
    else res.end()
  }

  server.on('request', handleRequest).on('upgrade', createSocket())
  fallback = await fs.promises.readFile(path.join(internaldir, '500.html'))

  function invalidate (abspath) {
    broadcast('reload')
  }

  const debouncedInvalidate = debounce(invalidate, 350)
  const ignored = [
    /node_modules/,
    path.join(scopedir, '.cache'),
    path.join(scopedir, 'dist')
  ]

  chokidar.watch(scopedir, { ignored: ignored })
    .on('change', debouncedInvalidate)
    .on('unlink', debouncedInvalidate)

  return server
}

module.exports = serve
