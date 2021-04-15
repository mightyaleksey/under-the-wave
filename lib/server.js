'use strict'

const crypto = require('crypto')
const http = require('http')

const startTime = Symbol('startTime')

function createServer (logger, port) {
  const server = http
    .createServer()
    .on('request', request)
    .listen(port)

  return server

  function request (req, res) {
    res[startTime] = res[startTime] ?? Date.now()

    const log = logger.child({ req: req })
    req.log = res.log = log

    res.on('error', finish)
    res.on('finish', finish)
  }

  function finish (err) {
    // this = response
    const responseTime = Date.now() - this[startTime]

    this.removeListener('error', finish)
    this.removeListener('finish', finish)

    if (err != null || this.statusCode >= 500) {
      const error = err ?? this.err ?? new Error('failed with status code ' + this.statusCode)
      this.log.error({ err: error, res: this, responseTime: responseTime }, 'request errored')
      return
    }

    this.log.info({ res: this, responseTime: responseTime }, 'request completed')
  }
}

const opcodes = {
  continuation: 0,
  text: 1,
  binary: 2,
  close: 8,
  ping: 9,
  pong: 10
}

function parseMessage (buffer) {
  // https://tools.ietf.org/html/rfc6455#section-5.2

  // 0 - 1 bit, 0 or 1, is final frame?
  // 000 - 3 bits, 000 - 111, reserved flags
  // 0000 - 4 bits, 0 - 15, opcode
  const firstByte = buffer.readUInt8(0)
  // const finalFrame = (firstByte >>> 7) & 1
  const opcode = firstByte & 15
  if (opcode === opcodes.close) return null
  if (opcode !== opcodes.text) return // ignore non-text messages

  // 0 - 1 bit, 0 or 1, is masked?
  // 0000000 - 7 bits, 0 - 125|126|127, payload length
  const secondByte = buffer.readUInt8(1)
  const masked = (secondByte >>> 7) & 1
  let length = secondByte & 127
  let offset = 2

  if (length > 125) {
    if (length === 126) {
      length = buffer.readUInt16BE(offset)
      offset += 2
    } else {
      // payload > 65.5kB
      throw new Error('payloads with size greater than 65535 are not supported')
    }
  }

  const data = Buffer.alloc(length)

  if (masked) {
    const masking = buffer.slice(offset, offset + 4)
    offset += 4

    for (let i = 0; i < length; ++i) {
      data.writeUint8(buffer.readUInt8(offset++) ^ masking[i % 4], i)
    }
  } else {
    buffer.copy(data, 0, offset)
  }

  return data.toString('utf8')
}

function serializeMessage (msg) {
  const length = Buffer.byteLength(msg)
  if (length > 65535) throw new Error('payloads with size greater than 65535 are not supported')
  const payloadLength = length > 125 ? 126 : length
  const payloadOffset = payloadLength === 126 ? 2 : 0
  const buffer = Buffer.alloc(2 + payloadOffset + length)
  buffer.writeUInt8(0b10000001, 0)
  buffer.writeUInt8(payloadLength, 1)
  // if payloadLength == 126, write real length to 3rd and 4th bit
  if (payloadOffset > 0) buffer.writeUInt16BE(length, 2)
  buffer.write(msg, 2 + payloadOffset)
  return buffer
}

const connections = new Set()

/**
 * Usage:
 * - server.on('upgrade', createSocket())
 * - broadcast(msg)
 */
function createSocket (handler) {
  return function upgrade (req, socket) {
    const url = new URL(req.url, 'http://localhost/')
    if (
      url.pathname !== '/~/socket/' ||
      req.headers.upgrade !== 'websocket'
    ) {
      socket.write('HTTP/1.1 400 Bad Request')
      socket.end()
      return
    }

    connections.add(socket)

    const acceptKey = req.headers['sec-websocket-key']
    const hash = crypto
      .createHash('sha1')
      .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
      .digest('base64')

    socket.write(
      'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
      'Upgrade: WebSocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${hash}\r\n` +
      '\r\n'
    )

    socket.on('end', function end () {
      connections.delete(socket)
    })

    if (typeof handler !== 'function') return

    function send (msg) {
      socket.write(serializeMessage(msg))
    }

    socket.on('data', function data (buffer) {
      handler(parseMessage(buffer), send)
    })
  }
}

function broadcast (msg) {
  connections.forEach(socket => socket.write(serializeMessage(msg)))
}

module.exports = {
  createServer,
  createSocket,
  broadcast
}
