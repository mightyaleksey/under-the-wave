'use strict'

const acorn = require('acorn')
const escodegen = require('escodegen')
const fs = require('fs')

const { walk } = require('../lib/t-script-utils-walk')

const abspath = require.resolve('object-assign/index.js')
// const abspath = require.resolve('react/cjs/react.development.js')
// const abspath = require.resolve('react-dom/cjs/react-dom.development.js')
const content = fs.readFileSync(abspath, 'utf8')

const options = {
  ecmaVersion: 'latest',
  sourceType: 'module'
}

const iterations = 1000
const time = Date.now()
let count = iterations
while (count--) {
  const ast = acorn.parse(content, options)
  walk(ast, [{}])
  escodegen.generate(ast)
}

const totalTime = Date.now() - time
console.log((iterations / totalTime * 1000).toFixed(2), 'ops/sec')
console.table(process.memoryUsage())
