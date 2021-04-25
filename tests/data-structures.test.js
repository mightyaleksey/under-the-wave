/* globals expect,jest,test */// eslint-disable-line no-unused-vars
'use strict'

const { Asset, ListItem } = require('../lib/data-structures')

test('Asset', () => {
  expect(new Asset('/app.js')).toEqual({
    outputPath: null,
    path: '/app.js',
    type: 'js'
  })

  expect(new Asset('/app.md', 'html')).toEqual({
    outputPath: null,
    path: '/app.md',
    type: 'html'
  })
})

test('Asset.from', () => {
  expect(Asset.from('/app.md', 'html')).toEqual({
    outputPath: null,
    path: '/app.md',
    type: 'html'
  })
})

test('ListItem', () => {
  const head = new ListItem(1)
  head.next = new ListItem(2)

  expect([...head]).toEqual([1, 2])
})

test('ListItem.from', () => {
  const head = ListItem.from(1, 2, 3)

  expect([...head]).toEqual([1, 2, 3])
})
