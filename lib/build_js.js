const join = require('path').join

/**
 * Builds JS
 */

module.exports = function buildJs (done) {
  const fname = join(__dirname, '../data/search.js')
  const browserify = require('browserify')
  const b = browserify()

  b.add(fname)
  b.transform(require('uglifyify'), { global: true, sourcemap: false })
  b.bundle(done)
}
