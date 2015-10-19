const compile = require('../../')()

describe('index/with_base:', function () {
  before(function (done) {
    // Mock metalsmith object
    var ms = {
      _meta: { docs: 'docs' },
      directory () { return __dirname },
      metadata () { return this._meta }
    }

    this.files = {
      'docs/README.md': {
        contents:
          '* [My project](../README.md)\n' +
          '* [Intro](intro.md)\n'
      },
      'README.md': {
        contents:
          '# My project\nHello.\n\n' +
          '### Usage\n' +
          'Use it wisely'
      },
      'docs/intro.md': {
        contents: '# Introduction\n'
      }
    }

    require('docpress-core')()(this.files, ms, (err) => {
      if (err) throw err
      compile(this.files, ms, (err) => {
        if (err) throw err
        require('docpress-base')()(this.files, ms, (err) => {
          if (err) throw err
          done()
        })
      })
    })
  })

  it('renders', function () {
    expect(this.files['intro.html']).toExist()
  })

  it('has assets/search.js', function () {
    expect(this.files['assets/search.js']).toExist()
  })

  it('includes search.js', function () {
    var contents = this.files['index.html'].contents
    expect(contents).toMatch(/assets\/search.js\?t=[a-f0-9]{8}/)
  })
})
