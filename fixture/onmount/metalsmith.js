/* istanbul ignore next */
(function() {
  var docpress = require('docpress-core/ms')

  var app = docpress(__dirname)
    .use(require('docpress-core')())
    .use(require('../../index')())

  if (module.parent) {
    module.exports = app
  } else {
    app.build(function (err) { if (err) throw err })
  }
}())
