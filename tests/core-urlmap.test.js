'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { ListItem } = require('../lib/core-data-structures')
const { Urlmap } = require('../lib/core-urlmap')

const testCases = [
  /* eslint-disable no-multi-spaces */
  { name: './x',   input: './counter.demo.js', output: 'static/counter.demo.js' },
  { name: '/~ar',  input: '/~ar/index.html',   output: 'index.html' },
  { name: '~ar',   input: '~ar/index.html',    output: 'index.html' },
  { name: '/~/x',  input: '/~/index.html',     output: 'index.html' },
  { name: '~/x',   input: '~/index.html',      output: 'index.html' },
  { name: '/x',    input: '/hello.js',         output: 'static/hello.js' },
  { name: '/p',    input: '/robots.txt',       output: 'public/robots.txt' },
  { name: 'react', input: 'react',             output: 'node_modules/react/index.js' }
  /* eslint-enable no-multi-spaces */
]

const scopedir = path.join(__dirname, 'fixture')
const workdir = path.join(scopedir, 'static')
const publicdir = path.join(scopedir, 'public')

const aliases = new Map([['~ar', scopedir]])
const directories = ListItem.from(scopedir, workdir, publicdir)
const referer = path.join(workdir, '_')

for (const { name, input, output } of testCases) {
  test(`Urlmap.map "${name}"`, () => {
    const urlmap = new Urlmap({ aliases, directories })
    const result = urlmap.map(input, referer)
    assert.ok(result != null)

    const file = path.relative(scopedir, result)
    assert.is(file, output)
  })
}

test.run()
