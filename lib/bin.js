#!/usr/bin/env node
'use strict'

process.title = 'under-the-wave'

const USAGE = `
  $ under-the-wave [entry] [options]

  Options:

    -b, --build      generate output files and quit
        --cache      location of the files used for caching
    -h, --help       print usage
    -o, --output     output location of the generated files
    -p, --port
    -w, --work-dir
`

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    build: 'b',
    help: 'h',
    output: 'o',
    port: 'p',
    'work-dir': 'w'
  },
  default: {
    cache: '.cache',
    output: '.dist',
    'work-dir': '.'
  },
  boolean: [
    'build',
    'help'
  ],
  string: [
    'cache',
    'output',
    'port',
    'work-dir'
  ]
})

if (argv.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

const path = require('path')
const { createLogger } = require('./logger')
const { findPackageRoot, loadSettings } = require('./utils')

const log = createLogger({ level: 'info', pretty: true })
run().catch(err => log.error({ err }, 'unhandled error'))

async function run () {
  const wd = path.resolve(argv['work-dir'])
  const packageRoot = await findPackageRoot(wd) ?? wd
  const settings = await loadSettings(packageRoot)

  const cache = path.resolve(packageRoot, argv.cache)
  const output = path.resolve(packageRoot, argv.output)
  const options = { cache, output, wd, settings }

  const input = argv.build ? argv._ : (isFinite(argv.port) ? Number(argv.port) : 1234)
  const cmd = argv.build
    ? require('./cmd-build')
    : require('./cmd-serve')

  return cmd(input, options, log)
}
