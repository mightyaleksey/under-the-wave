/* globals expect,test */
'use strict'

const { transformMarkup } = require('./utils')

test('t', async () => {
  const code = ''
  const expected = ''

  const result = await transformMarkup(code, () => {})
  expect(result).toBe(expected)
})
