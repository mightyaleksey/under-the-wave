'use strict'

/**
 * @interface
 */
class ILogger {
  child (context) {
    return new ILogger()
  }

  debug (context, message) {}
  error (context, message) {}
  info (context, message) {}
  trace (context, message) {}
  warn (context, message) {}
}

module.exports = {
  ILogger
}
