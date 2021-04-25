/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { Asset } = require('../lib/data-structures')
const { Context } = require('../lib/shared')
const { createUrlMap } = require('./_utils')

test('Context tracks dependencies', () => {
  const asset = Asset.from('/')
  const urlmap = createUrlMap()
  const context = new Context({ asset, urlmap })
  expect(context.deps).toEqual(new Set())

  context.resolve('/a')
  context.resolve('/b')
  context.resolve('/a')
  expect(context.deps).toEqual(new Set(['/a', '/b']))
})
