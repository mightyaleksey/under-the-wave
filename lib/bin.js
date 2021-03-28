#!/usr/bin/env node
'use strict'

process.title = 'under-the-wave'

const USAGE = `
  $ under-the-wave [entry] [options]

  Options:

    -h, --help   print usage
    -p, --port
`

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    help: 'h',
    port: 'p'
  },
  default: {
    output: '.dist'
  },
  boolean: [
    'help'
  ],
  string: [
    'dest'
  ]
})

if (argv.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

const base = argv._.length > 0 ? argv._[0] : '.'
const port = isFinite(argv.port) ? Number(argv.port) : 1234
const plugins = [require('../plugins/markdown-plugin')]
require('./cmd-serve')(port, base, plugins)
