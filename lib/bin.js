#!/usr/bin/env node
'use strict'

process.title = 'under-the-wave'

// how to choose working directory to build input files
const USAGE = `
  $ under-the-wave [entry] [options]

  Options:

    -h, --help     print usage
    -p, --port
`

const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
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

const path = require('path')
require('./cmd-serve')({
  port: isFinite(argv.port) ? Number(argv.port) : 1234,
  wd: argv._.length > 0 ? path.resolve(argv._[0]) : process.cwd()
}).then(null, console.log)
