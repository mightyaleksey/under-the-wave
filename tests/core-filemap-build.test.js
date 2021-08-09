'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { ListItem } = require('../lib/core-data-structures')
const { Filemap } = require('../lib/core-filemap-build')

const testCases = [
  /* eslint-disable no-multi-spaces */
  { name: '/h',   input: 'pages/index.html',      output: '/index.html' },
  { name: '/b/h', input: 'pages/blog/index.html', output: '/blog/index.html' },
  { name: '/c',   input: 'pages/app.css',         output: '/static/css/fwttar.css' },
  { name: '/j',   input: 'pages/app.js',          output: '/static/js/hecavts.js' },
  { name: '/m',   input: 'pages/preview.jpg',     output: '/static/media/uvmyqf.jpg' }
  /* eslint-enable no-multi-spaces */
]

const scopedir = path.join(__dirname, 'fixture')
const workdir = path.join(scopedir, 'pages') // fake
const publicdir = path.join(scopedir, 'public')

const directories = ListItem.from(scopedir, workdir, publicdir)
const referer = path.join(workdir, '_')

for (const { name, input, output } of testCases) {
  test(`Filemap.map "${name}"`, () => {
    const filemap = new Filemap({ directories })
    const file = path.join(scopedir, input)
    const result = filemap.map(file, referer)
    assert.ok(result != null)

    assert.is(result, output)
  })
}

test.run()
