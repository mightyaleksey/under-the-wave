'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { scope } = require('../lib/util-scope')

test('scope', async () => {
  const demoRoot = path.resolve(__dirname, './fixture')
  const root = path.resolve(__dirname, '..')

  assert.is(await scope(), null)
  assert.is(await scope(__dirname), root)
  assert.is(await scope(__filename), root)
  assert.is(await scope(path.join(demoRoot, 'public')), demoRoot)
})

test.run()
