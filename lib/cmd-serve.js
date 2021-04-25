'use strict'

const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

const { Asset } = require('./data-structures')
const { Cache } = require('./cache')
const { Context } = require('./shared')
const { UrlMap } = require('./url-map')
const { bufferStream, concatStream, tee } = require('./streams')
const { computeSalt, contentType } = require('./utils')
const { createEnv } = require('./environment')
const { createServer, createSocket, broadcast } = require('./server')
const { createStreams } = require('./plugins')
const { mkdir } = require('./fs-utils')

const bridge = path.join(__dirname, '../public/bridge.js')

const corePlugins = [
  require('../plugins/p-markup'),
  require('../plugins/p-script')
]

const suffixes = ['', 'index.html']

async function cmdserve (port, options, log) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development'

  log.trace('serve options %o', options)

  const env = createEnv()
  log.trace('environment variables %o', env)
  const plugins = options.settings.plugins.concat(corePlugins)
  const settings = options.settings

  const salt = computeSalt(env, options)
  const cache = new Cache({ cache: options.cache, salt: salt, suffix: '.serve' })
  const urlmap = new UrlMap({ wd: options.wd })

  async function middleware (req, res) {
    const url = new URL(req.url, `http://localhost:${port}/`)

    if (req.method !== 'GET') {
      res.writeHead(405, { allow: 'GET' })
      res.end()
      return
    }

    if (url.pathname === '/~/bridge/') {
      res.writeHead(200, { 'content-type': contentType('bridge.js') })
      await pipeline(fs.createReadStream(bridge), res)
      return
    }

    // resolve as file
    for (const suffix of suffixes) {
      const pathname = '.' + url.pathname + suffix
      // step to enumerate extensions
      const abspath = urlmap.find(pathname) // use a lightweight version?
      if (abspath == null) continue

      res.writeHead(200, {
        'content-type': contentType(abspath),
        'x-origin': 'file'
      })

      const asset = Asset.from(abspath)
      const cachedAssetPath = cache.sourcePath(asset)

      if (await cache.hasValid(asset)) {
        // load from cache
        await pipeline(
          fs.createReadStream(cachedAssetPath),
          res
        )
        return
      }

      const context = new Context({ asset, env, log, settings, urlmap }, options)
      const streams = createStreams(plugins, context, asset)
      if (streams.length > 0) {
        await mkdir(path.dirname(cachedAssetPath))
        streams.unshift(concatStream())
        streams.push(bufferStream())
        streams.push(tee(fs.createWriteStream(cachedAssetPath)))
      }

      await pipeline(
        fs.createReadStream(asset.path),
        ...streams,
        res
      )

      if (streams.length > 0) {
        await cache.set(asset, { deps: [...context.deps] })
      }

      return
    }

    res.writeHead(404)
    res.end()
  }

  function exec (req, res) {
    middleware(req, res).catch(err => {
      console.log(err)
      res.err = err
      res.writeHead(500)
      res.end()
    })
  }

  createServer(log, port)
    .on('request', exec)
    .on('upgrade', createSocket())

  // throttling + queue?
  async function invalidate (abspath) {
    const asset = Asset.from(abspath)
    if (!await cache.has(asset)) return

    await cache.delete(asset)
    broadcast('reload')
  }

  const ignored = [/node_modules/, options.cache, options.output]

  chokidar.watch(options.wd, { ignored: ignored })
    .on('change', invalidate)
    .on('unlink', invalidate)
}

module.exports = cmdserve
