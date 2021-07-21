'use strict'

const chokidar = require('chokidar')
const path = require('path')
const { exec } = require('child_process')

const coreDir = path.join(__dirname, '../lib')
const testDir = path.join(__dirname, '../tests')

chokidar
  .watch([coreDir, testDir])
  .on('change', debounce(test))

test()

function debounce (fn, ms = 250) {
  let timer = null
  return debounceWrapper

  function debounceWrapper (...args) {
    clearTimeout(timer)
    timer = setTimeout(fn, ms, ...args)
  }
}

function test () {
  console.clear()
  exec('npm test', (err, stdout, stderr) => {
    if (err) console.log(err.stack)
    if (stdout) process.stdout.write(stdout)
  })
}
