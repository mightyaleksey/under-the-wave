'use strict'

const assert = require('uvu/assert')
const { inspect } = require('util')
const { test } = require('uvu')

const { ListItem } = require('../lib/core-data-structures')

test('ListItem', () => {
  const item = new ListItem(1)
  assert.is(item.next, null)
  assert.is(item.value, 1)
})

test('ListItem.from', () => {
  const list = ListItem.from(1, 2)
  const head = new ListItem(1)
  head.next = new ListItem(2)
  assert.equal(list, head)
})

test('ListItem iterator', () => {
  const list = ListItem.from(1, 2, 3)
  assert.equal([...list], [1, 2, 3])
})

test('ListItem inspect', () => {
  const string = inspect(ListItem.from(1, 2, 3))
  assert.is(string, 'ListItem → 1 → 2 → 3')
})

test.run()
