'use strict'

const { ListItem } = require('./data-structures')

const _sequence = 'abcdefghijklmnopqrstuvwxyz'

function abc (digit) {
  let seq = ''
  let rest = digit

  while (rest >= _sequence.length) {
    seq = `${_sequence.charAt(rest % _sequence.length)}${seq}`
    rest = Math.floor(rest / _sequence.length) - 1
  }

  return `${_sequence.charAt(rest)}${seq}`
}

function getPluginAliases (extension, aliases) {
  const list = new ListItem(extension)
  list.next = aliases[extension] ?? null
  return list
}

function mapPluginExtensions (plugins) {
  const aliases = {}
  for (let i = plugins.length; i--;) {
    const plugin = plugins[i]
    const list = ListItem.from(plugin.extensions)
    list.next = aliases[plugin.alias] ?? null
    aliases[plugin.alias] = list
  }

  return aliases
}

module.exports = {
  abc,
  getPluginAliases,
  mapPluginExtensions
}
