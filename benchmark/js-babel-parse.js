'use strict'

const babel = require('@babel/core')
const fs = require('fs')

// const abspath = require.resolve('object-assign/index.js')
const abspath = require.resolve('react/cjs/react.development.js')
// const abspath = require.resolve('react-dom/cjs/react-dom.development.js')
const content = fs.readFileSync(abspath, 'utf8')

const options = {
  ast: false,
  babelrc: false,
  cloneInputAst: false,
  code: false,
  comments: true,
  compact: false,
  configFile: false,
  filename: abspath,
  minified: false,
  retainLines: true,
  plugins: []
}

const iterations = 1000
const time = Date.now()
let count = iterations
while (count--) {
  babel.parseSync(content, options)
}

const totalTime = Date.now() - time
console.log((iterations / totalTime * 1000).toFixed(2), 'ops/sec')
console.log(process.memoryUsage())
