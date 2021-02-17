'use strict'

const { List } = require('./data-types')
const { write } = require('./file-utils')
const Graph = require('./graph')
const Resolver = require('./resolver')
const Transformer = require('./transformer')
const UrlMapper = require('./url-mapper')

const pluginIdentity = require('./plugin-identity')
const pluginMarkup = require('./plugin-markup')
const pluginScript = require('./plugin-script')
const pluginStyle = require('./plugin-style')

async function cmdbuild ({ dist, input, wd }) {
  if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'production'

  const list = new List(...input)
  const graph = new Graph()
  const resolver = new Resolver()
  const urlmapper = new UrlMapper({ base: wd, dist, scheme: 'sort' })
  const transformer = new Transformer({
    plugins: {
      '.css': pluginStyle,
      '.html': pluginMarkup,
      '.js': pluginScript,
      '': pluginIdentity
    },
    resolver,
    urlmapper
  })

  for (const abspath of list.queue()) {
    if (graph.has(abspath)) continue

    const file = graph.add(abspath)
    const deps = await transformer.transform(file)

    const destpath = urlmapper.dest(file.path)
    await write(destpath, file.content, 'utf8')
    file.content = null

    deps.forEach(dependency => {
      list.push(dependency)
    })
  }
}

module.exports = cmdbuild
