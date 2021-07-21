'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const { createServer, findFreePort } = require('../lib/util-server')
const { curl, delay } = require('./_utils')

test('createServer', async () => {
  const port = await findFreePort()
  const server = createServer(port)

  let message = null

  server.once('request', (req, res) => {
    message = req.url.substring(1)

    res.statusCode = 200
    res.end()
  })

  await Promise.race([
    curl(port, 'hello'),
    delay(100)
  ])

  server.close()

  assert.is(message, 'hello')
})

test.run()
