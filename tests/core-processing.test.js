'use strict'

const assert = require('uvu/assert')
const { inspect } = require('util')
const { test } = require('uvu')

const { Processing } = require('../lib/core-processing')

test('Processing inspect', () => {
  const processing = new Processing({ cmd: 'test', url: '/index.html', abspath: '/www/index.html', plugins: [] })

  const string = inspect(processing)
  const output = 'Processing → { url: \'/index.html\', abspath: \'/www/index.html\', plugins: [] }'

  assert.is(string, output)
})

test.run()
