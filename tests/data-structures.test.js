/* globals expect,test */
'use strict'

const { ListItem } = require('../lib/data-structures')

test('ListItem', () => {
  const head = new ListItem(1)
  head.next = new ListItem(2)
  expect([...head]).toEqual([1, 2])
})

test('ListItem.from', () => {
  const head = ListItem.from(1, 2, 3)
  expect([...head]).toEqual([1, 2, 3])
})
