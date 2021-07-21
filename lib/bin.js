#!/usr/bin/env node
'use strict'

process.title = 'under-the-wave'

const USAGE = `
  $ under-the-wave [entry] [options]

  Options:

    -b, --build      generate output files and quit
    -h, --help       print usage
        --no-cache   turn off caching
    -p, --port       specify a port for a server to use
    -w, --work-dir   specify a directory to resolve files from

  Examples:

    Start a development server
    $ wave --port 1234

    Pack and optimise all files in the project
    $ wave ./index.html --build
`

const argv = require('minimist')(
  process.argv.slice(2),
  {
    alias: {
      build: 'b',
      help: 'h',
      port: 'p',
      'work-dir': 'w'
    },
    boolean: ['build', 'cache', 'help'],
    string: ['work-dir'],
    default: {
      cache: true,
      'work-dir': '.'
    }
  }
)

if (argv.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

const { Logger } = require('./util-logger')
const logger = new Logger({ level: 'trace', pretty: true })

;(argv.build
  ? require('./cmd-build')
  : require('./cmd-serve')
)(argv, logger).catch(err => {
  logger.error({ err }, 'command errored')
})
