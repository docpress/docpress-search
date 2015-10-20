'use strict'

const ware = require('ware')
const assign = Object.assign

const useCache = require('./lib/helpers/use_cache')
const buildJs = require('./lib/build_js')
const memoize = require('./lib/memoize')

module.exports = function search (options) {
  const ctx = {}

  var app = ware()
    .use(updateIndex.bind(ctx))
    .use(addMeta.bind(ctx))
    .use(addJs.bind(ctx))

  return function (files, ms, done) {
    app.run(files, ms, done)
  }
}

/**
 * Internal: actual indexing happens here
 */

function updateIndex (files, ms, done) {
  const idx = {}

  Object.keys(files).forEach((fname) => {
    const file = files[fname]
    // memoize based on file contents
    if (file.$) {
      const cacheKey = [ ms.directory(), fname, file.contents ]
      const newIndices = memoize(['index', cacheKey], () => {
        return index(fname, file)
      })
      assign(idx, newIndices)
    }
  })

  extendIndex(files['_docpress.json'], (file) => {
    file.searchIndex = idx
    file.lunrIndex = memoize([ 'lunr', ms.directory(), idx ], () => {
      return JSON.stringify(lunrize(idx))
    })
  })

  done()
}

/**
  Internal: adds the search.js file
 */

function addJs (files, ms, done) {
  const callback = (err, contents) => {
    if (err) return done(err)
    contents =
      'window.__searchindex=(' +
      JSON.stringify(files['_docpress.json'].searchIndex, null, 2) +
      ');\n' +
      'window.__lunrindex=(' +
      files['_docpress.json'].lunrIndex +
      ');\n' + contents
    files['assets/search.js'] = { contents }
    done()
  }

  useCache('cache/search.js', callback) ||
    buildJs({}, callback)
}

/**
 * Internal: tells docpress-base to add search.js as a script
 */

function addMeta (files, ms, done) {
  const meta = ms.metadata()
  if (!meta.js) meta.js = []
  if (meta.js.indexOf('assets/search.js') === -1) {
    meta.js.push('assets/search.js')
  }
  done()
}

/*
 * Internal: turns the index into a lunr object
 */

function lunrize (idx) {
  const lunr = require('lunr')
  const index = lunr(function () {
    this.field('title', { boost: 10 })
    // todo: boost if heading
    this.field('pagetitle', { boost: 3 })
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
  file.contents = JSON.stringify(file)
}

/**
 * Internal: adds new indexes to `idx` from the file `file`/`fname`.
 */

function index (fname, file) {
  let slug = fname
  let title = file.title
  let idx = {}

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

  return idx

  function initial () {
    return {
      title: title,
      pagetitle: file.title,
      slug: slug,
      body: ''
    }
  }
}
