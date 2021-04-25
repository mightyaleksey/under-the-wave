'use strict'

const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

const { Asset } = require('./data-structures')
const { Cache } = require('./cache')
const { BuildContext } = require('./shared')
const { UrlMap } = require('./url-map')
const { bufferStream, concatStream, tee } = require('./streams')
const { computeSalt, output } = require('./utils')
const { createStreams } = require('./plugins')
const { createEnv } = require('./environment')
const { mkdir } = require('./fs-utils')
const { queue } = require('./scheduler')

const corePlugins = [
  require('../plugins/p-markup'),
  require('../plugins/p-markup-optimise'),
  require('../plugins/p-script'),
  require('../plugins/p-script-optimise'),
  require('../plugins/p-style'),
  require('../plugins/p-style-optimise'),
  // external
  require('../plugins/p-markdown')
]

// use stream for input files
// and prob turn the whole command into another stream
function cmdbuild (input, options, log) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'production'

  log.trace('build options %o', options)

  const env = createEnv()
  log.trace('environment variables %o', env)
  const plugins = options.settings.plugins.concat(corePlugins)
  const settings = options.settings
  const visited = new Set()

  const salt = computeSalt(env, options)
  const cache = new Cache({ cache: options.cache, salt: salt, suffix: '.build' })
  const urlmap = new UrlMap({ wd: options.output })

  const q = queue(worker, null, { concurrency: 10, promise: true })
  const cwd = process.cwd()

  for (const file of input) {
    const abspath = path.resolve(cwd, file)
    const asset = Asset.from(abspath)
    asset.outputPath = output(asset, options)
    push(asset)
  }

  return q.drain().catch(err => console.log(err.stack))

  function push (asset) {
    if (visited.has(asset.path)) return
    visited.add(asset.path)
    q.push(asset)
  }

  async function worker (asset) {
    const cachedAssetPath = cache.sourcePath(asset)
    const outputPath = asset.outputPath

    await mkdir(path.dirname(outputPath))

    const outputStream = fs.createWriteStream(outputPath)

    if (await cache.hasValid(asset)) {
      const meta = await cache.get(asset)

      // add dependencies to the queue as well, thus all files
      // will be copied even from cache
      meta.deps.forEach(dependency => {
        const asset = Asset.from(dependency)
        asset.outputPath = output(asset, options)
        push(asset)
      })

      // load from cache
      const streams = [
        fs.createReadStream(cachedAssetPath),
        outputStream
      ]

      await pipeline(streams)
      return
    }

    const context = new BuildContext({ asset, env, log, push, settings, urlmap }, options)
    const streams = createStreams(plugins, context, asset)
    if (streams.length === 0) {
      // nothing to transform, send file as is
      const streams = [
        fs.createReadStream(asset.path),
        outputStream
      ]

      await pipeline(streams)
      return
    }

    await mkdir(path.dirname(cachedAssetPath))

    await pipeline(
      fs.createReadStream(asset.path),
      concatStream(),
      ...streams,
      bufferStream(),
      tee(fs.createWriteStream(cachedAssetPath)),
      outputStream
    )

    await cache.set(asset, { deps: [...context.deps] })
  }
}

module.exports = cmdbuild
