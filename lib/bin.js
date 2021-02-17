#!/usr/bin/env node
'use strict'

process.title = 'under-the-wave'

// how to choose working directory to build input files
const USAGE = `
  $ under-the-wave [entry] [options]

  Options:

    -h, --help     print usage
    -b, --build
    -o, --output
`

const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
  alias: {
    build: 'b',
    help: 'h',
    output: 'o'
  },
  default: {
    output: '.dist'
  },
  boolean: [
    'build',
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

;(argv.build
  ? require('./cmd-build')({
      dist: path.resolve(argv.output),
      // use glob?
      input: argv._.map(a => path.resolve(a)),
      // think of a better approach, basically it should match top directory of the first file
      wd: process.cwd()
    })
  : require('./cmd-serve')({
    port: 1234,
    wd: argv._.length > 0 ? path.resolve(argv._[0]) : process.cwd()
  })).then(null, console.log)
