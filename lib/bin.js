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

const path = require('path')
const { findPackageScope, loadJson } = require('./fs-utils')

function requireModule (mpath, from) {
  if (
    mpath.startsWith('../') ||
    mpath.startsWith('./') ||
    mpath.startsWith('/')
  ) return require(path.resolve(from, mpath))

  return require(mpath)
}

async function execCommand () {
  const base = path.resolve(argv._.length > 0 ? argv._[0] : '.')
  const port = isFinite(argv.port) ? Number(argv.port) : 1234

  const scopeFile = await findPackageScope(base)
  const settings = (scopeFile != null && (await loadJson(scopeFile))['under-the-wave']) ?? null

  const plugins = [require('../plugins/markdown-plugin')]
  if (Array.isArray(settings?.plugins)) {
    for (const plugin of settings.plugin) {
      plugins.push(requireModule(plugin, path.dirname(scopeFile)))
    }
  }

  require('./cmd-serve')(port, base, plugins)
}

execCommand().catch(console.log)
