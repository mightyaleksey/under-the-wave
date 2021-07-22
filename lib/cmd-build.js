'use strict'

const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

const { FilemapWithOutput } = require('./core-filemap-with-output')
const { ProcessingFactory } = require('./core-processing-factory')
const { ProcessingWithCache } = require('./core-processing-with-cache')
const { copy, mkdir } = require('./util-fs')
const { createEnv } = require('./util-env')
const { loadPackageSettings } = require('./core-settings')
const { queue } = require('./util-scheduler')
const { scope } = require('./util-scope')

const corePlugins = [
  require('../plugins/p-markdown'),
  require('../plugins/p-markup'),
  require('../plugins/p-markup-optimise'),
  require('../plugins/p-script'),
  require('../plugins/p-script-optimise'),
  require('../plugins/p-style'),
  require('../plugins/p-style-optimise'),
  // put identity in the end, since it is a generic plugin
  require('../plugins/p-identity')
]

async function build (options, logger) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'production'

  const wd = path.resolve(options['work-dir'])
  const packageScope = await scope(wd) ?? wd
  const settings = await loadPackageSettings(packageScope)
  const distDirectory = path.join(packageScope, 'dist')
  const publicDirectory = path.join(packageScope, 'public')

  const visited = new Set()

  const env = createEnv()
  logger.debug('environment variables %o', env)

  const processingFactory = new ProcessingFactory({ plugins: corePlugins })
  if (options.cache) processingFactory.Product = ProcessingWithCache
  processingFactory.filemap = new FilemapWithOutput({ packageScope, wd })
  processingFactory.env = env
  processingFactory.cmd = 'build'
  processingFactory.settings = settings

  const fakeReferer = path.join(wd, '_') // points to imaginary file

  const q = queue(worker, null, { concurrency: 10, promise: true })

  await copy(publicDirectory, distDirectory)

  const cwd = process.cwd()
  for (const input of options._) {
    const filepath = path.resolve(cwd, input)
    const processing = processingFactory.create(filepath, fakeReferer)
    enqueue(processing)
  }

  logger.info('compiling & compressing files')

  return q.drain()

  function enqueue (processing) {
    if (processing == null) return

    const publicUrl = processing.publicUrl()
    if (visited.has(publicUrl)) return
    visited.add(publicUrl)

    q.push(processing)
  }

  async function worker (processing) {
    const abspath = path.join(distDirectory, processing.publicUrl())
    await mkdir(path.dirname(abspath))

    const startTime = Date.now()
    const dest = fs.createWriteStream(abspath)
    await pipeline(...await processing.getStreams(), dest)

    logger.info(
      { responseTime: Date.now() - startTime },
      'processing completed %s → %s',
      path.relative(packageScope, processing.abspath),
      path.relative(packageScope, abspath)
    )

    processing.dependencies().forEach(enqueue)
  }
}

module.exports = build
