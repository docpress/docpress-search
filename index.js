'use strict'

const join = require('path').join

module.exports = function search () {
  return function search (files, ms, done) {
    let idx = {}

    Object.keys(files).forEach((fname) => {
      const file = files[fname]
      if (file.$) index(fname, file, idx)
    })

    extendIndex(files['docpress.json'], (file) => {
      file.searchIndex = idx
    })

    buildJs((err, contents) => {
      if (err) return done(err)
      files['search.js'] = { contents }
      done()
    })
  }
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
    } else {
      if (!idx[slug]) {
        idx[slug] = {
          title: title,
          pagetitle: file.title,
          slug: slug,
          text: ''
        }
      } else {
        idx[slug].text += ' ' + $this.text()
      }
    }
  })
}

/**
 * Builds JS
 */

function buildJs (done) {
  const fname = join(__dirname, 'data/search.js')
  const browserify = require('browserify')
  const b = browserify()
  b.add(fname)
  b.transform({ global: true }, 'uglifyify')
  b.bundle(done)
}
