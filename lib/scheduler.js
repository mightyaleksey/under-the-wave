'use strict'

const EventEmitter = require('events')

function queue (worker, shared, options) {
  const concurrency = options?.concurrency != null ? options.concurrency : 1
  if (options?.promise === true) {
    const workerPromise = worker
    worker = (task, shared, done) => workerPromise(task, shared)
      .then(r => done(null, r), done)
  }

  const ee = new EventEmitter()
  const q = { paused: false, running: 0, tasks: [] }

  function process () {
    if (q.running >= concurrency) return
    if (q.tasks.length === 0) return

    q.running++
    setImmediate(worker, q.tasks.shift(), shared, done)

    function done (err) {
      q.running--

      if (q.paused) return
      if (err) {
        q.paused = true
        ee.emit('error', err)
        return
      }

      if (q.tasks.length === 0) {
        q.paused = true
        ee.emit('drain')
        return
      }

      process()
    }
  }

  return {
    drain () {
      return new Promise((resolve, reject) => {
        ee.once('drain', done)
        ee.once('error', done)

        function done (err) {
          if (err) reject(err)
          else resolve()
        }
      })
    },
    push (task) {
      q.tasks.push(task)
      process()
    }
  }
}

module.exports = {
  queue
}
