'use strict'

/**
 * @interface
 */
class ILogger {
  child (context) {
    return new ILogger()
  }

  trace (context, message) {}
  debug (context, message) {}
  info (context, message) {}
  error (context, message) {}
}

module.exports = {
  ILogger
}
