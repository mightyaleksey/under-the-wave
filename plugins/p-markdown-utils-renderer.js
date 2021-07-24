'use strict'

const Renderer$1 = require('marked/src/Renderer')
const { cleanUrl, escape } = require('marked/src/helpers')

function attrs (...args) {
  if (args.length < 2) return ''

  let string = ''
  for (let i = 0; i < args.length; i += 2) {
    if (args[i + 1]) string += ' ' + args[i] + '="' + args[i + 1] + '"'
  }

  return string
}

class Renderer extends Renderer$1 {
  constructor (classNames, markedOptions) {
    super(markedOptions)

    this._code = classNames?.code
    this._blockquote = classNames?.blockquote
    this._heading = classNames?.heading
    this._hr = classNames?.hr
    this._list = classNames?.list
    this._checkbox = classNames?.checkbox
    this._paragraph = classNames?.paragraph
    this._table = classNames?.table

    this._strong = classNames?.strong
    this._em = classNames?.em
    this._codespan = classNames?.codespan
    this._del = classNames?.del
    this._link = classNames?.link
    this._image = classNames?.image
  }

  code (code, infostring, escaped) {
    const lang = (infostring || '').match(/\S*/)[0]
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang)
      if (out != null && out !== code) {
        escaped = true
        code = out
      }
    }

    code = code.replace(/\n$/, '') + '\n'

    const klass = ((lang ? this.options.langPrefix + escape(lang, true) : '') + ' ' + (this._code ? this._code : '')).trim()
    return '<pre><code' + attrs('class', klass) + '>' + (escaped ? code : escape(code, true)) + '</code></pre>\n'
  }

  blockquote (quote) {
    return '<blockquote' + attrs('class', this._blockquote) + '>\n' + quote + '</blockquote>\n'
  }

  html (html) {
    return html
  }

  heading (text, level, raw, slugger) {
    if (this.options.headerIds) {
      return '<h' + level + attrs('id', this.options.headerPrefix + slugger.slug(raw), 'class', this._heading) + '>' + text + '</h' + level + '>\n'
    }

    // ignore IDs
    return '<h' + level + attrs('class', this._heading) + '>' + text + '</h' + level + '>\n'
  }

  hr () {
    return '<hr' + attrs('class', this._hr) + (this.options.xhtml ? '/' : '') + '>\n'
  }

  list (body, ordered, start) {
    const type = ordered ? 'ol' : 'ul'
    const startatt = (ordered && start !== 1) ? (' start="' + start + '"') : ''
    return '<' + type + startatt + attrs('class', this._list) + '>\n' + body + '</' + type + '>\n'
  }

  listitem (text) {
    return '<li>' + text + '</li>\n'
  }

  checkbox (checked) {
    return '<input ' +
      (checked ? 'checked="" ' : '') +
      'disabled="" type="checkbox"' +
      (this.options.xhtml ? ' /' : '') +
      '> '
  }

  paragraph (text) {
    return '<p' + attrs('class', this._paragraph) + '>' + text + '</p>\n'
  }

  table (header, body) {
    if (body) body = '<tbody>' + body + '</tbody>'

    return '<table' + attrs('class', this._table) + '>\n' +
      '<thead>\n' +
      header +
      '</thead>\n' +
      body +
      '</table>\n'
  }

  tablerow (content) {
    return '<tr>\n' + content + '</tr>\n'
  }

  tablecell (content, flags) {
    const type = flags.header ? 'th' : 'td'
    const tag = flags.align
      ? '<' + type + ' align="' + flags.align + '">'
      : '<' + type + '>'
    return tag + content + '</' + type + '>\n'
  }

  // span level renderer
  strong (text) {
    return '<strong' + attrs('class', this._strong) + '>' + text + '</strong>'
  }

  em (text) {
    return '<em' + attrs('class', this._em) + '>' + text + '</em>'
  }

  codespan (text) {
    return '<code' + attrs('class', this._codespan) + '>' + text + '</code>'
  }

  del (text) {
    return '<del' + attrs('class', this._del) + '>' + text + '</del>'
  }

  link (href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
    if (href === null) return text

    return '<a' + attrs('href', escape(href), 'title', title, 'class', this._link) + '>' + text + '</a>'
  }

  image (href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
    if (href === null) return text

    return '<img' + attrs('src', href, 'alt', text, 'title', title, 'class', this._image) + (this.options.xhtml ? '/' : '') + '>'
  }
}

module.exports = {
  Renderer
}
