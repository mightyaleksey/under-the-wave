/* globals expect,test */
'use strict'

const { ListItem, List } = require('../lib/data-structures')

test('ListItem', () => {
  const head = new ListItem(1)
  head.next = new ListItem(2)
  expect([...head]).toEqual([1, 2])
})

test('ListItem.from', () => {
  const head = ListItem.from(1, 2, 3)
  expect([...head]).toEqual([1, 2, 3])
})

test('List', () => {
  const list = new List()
  list.push(1).push(2).push(3)
  expect([...list]).toEqual([1, 2, 3])
})

test('List.queue', () => {
  const data = [1, 2, 3]
  const size = [2, 1, 0]
  const list = new List(...data)

  let i = 0
  for (const item of list.queue()) {
    expect(item).toBe(data[i])
    expect(list.size).toBe(size[i])
    i++
  }

  list.push(5).push(6)
  const queue = list.queue()
  expect(queue.next().value).toBe(5)
  expect(list.size).toBe(1)

  list.push(7)
  expect(list.size).toBe(2)
  expect([...queue]).toEqual([6, 7])
})
