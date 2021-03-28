'use strict'

const fs = require('fs')
const showdown = require('showdown')
const converter = new showdown.Converter()

const abspath = require.resolve('../readme.md')
const content = fs.readFileSync(abspath, 'utf8')

const iterations = 1000
const time = Date.now()
let count = iterations
while (count--) {
  converter.makeHtml(content)
}

const totalTime = Date.now() - time
console.log((iterations / totalTime * 1000).toFixed(2), 'ops/sec')
console.table(process.memoryUsage())
