'use strict'
const fixture = require('./support/fixture')

describe('fixture', function () {
  let fx = fixture('onmount')
  let app

  before(function (done) {
    app = require(fx.path('metalsmith.js'))
    app.build((err, files) => {
      if (err) return done(err)
      this.files = files
      done()
    })
  })

  it('appends searchIndex metadata to docpress.json', function () {
    expect(this.files['_docpress.json'].searchIndex).toExist()
  })

  it('writes searchIndex into docpress.json as well', function () {
    expect(JSON.parse(fx.read('_docpress/_docpress.json')).searchIndex).toExist()
  })

  it('creates search.js', function () {
    expect(this.files['assets/search.js']).toExist()
  })
})
