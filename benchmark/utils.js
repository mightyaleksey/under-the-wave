'use strict'

function estimate (cases, iterations = 1) {
  for (const fn of cases) {
    console.time(fn.name)
    let count = iterations
    while (count--) {
      fn()
    }
    console.timeEnd(fn.name)
  }
}

module.exports = {
  estimate
}
