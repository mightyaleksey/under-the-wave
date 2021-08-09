'use strict'

const assert = require('uvu/assert')
const path = require('path')
const { test } = require('uvu')

const { packageScope } = require('../lib/util-scope')

test('packageScope', async () => {
  const demoRoot = path.resolve(__dirname, './fixture')
  const root = path.resolve(__dirname, '..')

  assert.is(await packageScope(), null)
  assert.is(await packageScope(__dirname), root)
  assert.is(await packageScope(__filename), root)
  assert.is(await packageScope(path.join(demoRoot, 'public')), demoRoot)
})

test.run()
