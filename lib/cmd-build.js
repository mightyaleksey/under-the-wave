'use strict'

const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

const { ListItem } = require('./core-data-structures')
const { Filemap } = require('./core-filemap-build')
const { Urlmap } = require('./core-urlmap')
const { ProcessingFactory } = require('./core-processing-factory')
const { ProcessingWithCache } = require('./core-processing-with-cache')
const { copy, mkdir } = require('./util-fs')
const { createEnv } = require('./util-env')
const { loadCustomPlugins, loadPackageSettings } = require('./core-settings')
const { packageScope } = require('./util-scope')
const { queue } = require('./util-scheduler')

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

  const env = createEnv()
  const workdir = path.resolve(options['work-dir'])
  const scopedir = await packageScope(workdir) ?? workdir
  const settings = await loadPackageSettings(scopedir)
  const distdir = path.join(scopedir, 'dist')
  const publicdir = path.join(scopedir, 'public')

  logger.debug('environment variables %o', env)
  logger.debug('package settings %o', settings)

  const fakeReferer = path.join(workdir, '_') // points to imaginary file
  const visited = new Set()

  const plugins = loadCustomPlugins(settings.wave?.plugins, scopedir).concat(corePlugins)
  // adds dist dir here as well to be able to resolve already handled dependencies.
  // todo skip urlmap step in favour of visited paths
  const directories = ListItem.from(scopedir, workdir, publicdir, distdir)
  const filemap = new Filemap({ directories })
  const urlmap = new Urlmap({ directories })
  const cmd = 'build'

  const factoryOptions = { plugins, filemap, urlmap, cmd, env, settings, logger }
  if (options.cache) factoryOptions.product = ProcessingWithCache

  const processingFactory = new ProcessingFactory(factoryOptions)

  const q = queue(worker, null, { concurrency: 10, promise: true })

  await copy(publicdir, distdir)

  const cwd = process.cwd()
  for (const input of options._) {
    const filepath = './' + path.relative(workdir, path.resolve(cwd, input))
    const processing = processingFactory.resolve(filepath, fakeReferer)
    enqueue(processing)
  }

  logger.info('compiling & compressing files')

  return q.drain()

  function enqueue (processing) {
    if (processing == null) return

    const id = processing.id
    if (visited.has(id)) return
    visited.add(id)

    q.push(processing)
  }

  async function worker (processing) {
    const abspath = path.join(distdir, processing.publicUrl())
    await mkdir(path.dirname(abspath))

    const startTime = Date.now()
    const dest = fs.createWriteStream(abspath)
    await pipeline(...await processing.transform(), dest)

    logger.info(
      { responseTime: Date.now() - startTime },
      'processing completed %s → %s',
      path.relative(scopedir, processing.abspath),
      path.relative(scopedir, abspath)
    )

    for (const dependency of processing.dependencies.values()) {
      enqueue(dependency)
    }
  }
}

module.exports = build
