'use strict'

const babel = require('@babel/core')
const fs = require('fs')

const { abspath, iterations } = require('./walk')

const content = fs.readFileSync(abspath, 'utf8')

const options = {
  ast: false,
  babelrc: false,
  cloneInputAst: false,
  code: true,
  comments: true,
  compact: false,
  configFile: false,
  filename: abspath,
  minified: false,
  retainLines: true,
  plugins: []
}

const ast = babel.parseSync(content, options)

let count = iterations
const time = Date.now()
while (count--) {
  babel.transformFromAst(ast, content, options)
}
const totalTime = Date.now() - time
console.log(
  'babel walk: %s opts/sec (%sms)',
  (iterations * 1000 / totalTime).toFixed(0),
  totalTime
)

const m = process.memoryUsage()
console.log()
console.log(' - rss:       %s', m.rss.toLocaleString())
console.log(' - heapTotal: %s', m.heapTotal.toLocaleString())
console.log(' - heapUsed:  %s', m.heapUsed.toLocaleString())
console.log()
