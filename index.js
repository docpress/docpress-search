'use strict'

const join = require('path').join

module.exports = function search () {
  return function search (files, ms, done) {
    let idx = {}

    Object.keys(files).forEach((fname) => {
      const file = files[fname]
      if (file.$) index(fname, file, idx)
    })

    extendIndex(files['_docpress.json'], (file) => {
      file.searchIndex = idx
      file.lunrIndex = JSON.stringify(lunrize(idx))
    })

    buildJs((err, contents) => {
      if (err) return done(err)
      // TODO
      contents =
        'window.__searchindex=(' +
        JSON.stringify(files['_docpress.json'].searchIndex) +
        ')\n' +
        'window.__lunrindex=(' +
        files['_docpress.json'].lunrIndex +
        ')\n' + contents
      files['search.js'] = { contents }
      done()
    })
  }
}

function lunrize (idx) {
  const lunr = require('lunr')
  const index = lunr(function () {
    this.field('title', { boost: 10 })
    this.field('pagetitle')
    this.field('body')
    this.ref('slug')
  })
  Object.keys(idx).forEach((slug) => {
    index.add(idx[slug])
  })
  return index
}

/**
 * Internal: extends `docpress.json` with more metadata. It will rewrite
 * `contents` afterwards.
 */

function extendIndex (file, block) {
  delete file.contents
  block(file)
  file.contents = JSON.stringify(file, null, 2)
}

/**
 * Internal: adds new indexes to `idx` from the file `file`/`fname`.
 */

function index (fname, file, idx) {
  let slug = fname
  let title = file.title

  file.$(':root').each(function () {
    const $this = file.$(this)
    if ($this.is('h2, h3, h4, h5, h6')) {
      slug = fname + '#' + $this.attr('id')
      title = $this.text()
      idx[slug] = initial()
    } else {
      if (!idx[slug]) {
        idx[slug] = initial()
      } else {
        if (idx[slug].body.length) {
          idx[slug].body += '\n' + $this.text()
        } else {
          idx[slug].body = $this.text()
        }
      }
    }
  })

  function initial () {
    return {
      title: title,
      pagetitle: file.title,
      slug: slug,
      body: ''
    }
  }
}

/**
 * Builds JS
 */

function buildJs (done) {
  const fname = join(__dirname, 'data/search.js')
  const browserify = require('browserify')
  const b = browserify()

  b.add(fname)
  b.transform(require('uglifyify'), { global: true, sourcemap: false })
  b.bundle(done)
}
