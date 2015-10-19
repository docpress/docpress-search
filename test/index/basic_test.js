const compile = require('../../')()

describe('index/basic:', function () {
  before(function (done) {
    // Mock metalsmith object
    var ms = {
      directory () { return __dirname },
      metadata () { return { docs: 'docs' } }
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
        done()
      })
    })
  })

  before(function () {
    this.idx = this.files['_docpress.json'].searchIndex
    this.lunrIndex = this.files['_docpress.json'].lunrIndex
  })

  it('renders', function () {
    expect(this.files['intro.html']).toExist()
  })

  it('has lunr indices', function () {
    expect(this.lunrIndex).toExist()
    expect(this.lunrIndex).toBeA('string')
  })

  it('has search indices', function () {
    expect(this.idx).toExist()
  })

  it('indexes the first page', function () {
    expect(this.idx['index.html']).toExist()
    expect(this.idx['index.html'].title).toEqual('My project')
    expect(this.idx['index.html'].pagetitle).toEqual('My project')
    expect(this.idx['index.html'].body).toEqual('Hello.')
  })

  it('indexes the first page\'s 1st heading', function () {
    expect(this.idx['index.html#usage']).toExist()
    expect(this.idx['index.html#usage'].title).toEqual('Usage')
    expect(this.idx['index.html#usage'].pagetitle).toEqual('My project')
    expect(this.idx['index.html#usage'].body).toEqual('Use it wisely')
  })

  describe('lunr', function () {
    before(function () {
      const lunr = require('lunr')
      this.lunr = lunr.Index.load(JSON.parse(this.lunrIndex))
    })

    it('works', function () {
      expect(this.lunr).toExist()
    })

    it('can search', function () {
      var results = this.lunr.search('usage')
      expect(results.length).toEqual(1)
      expect(results[0].ref).toEqual('index.html#usage')
    })
  })

  // describe('search.js', function () {
  //   beforeEach(function () {
  //     global.window = {}
  //     const code = this.files['assets/search.js'].contents
  //     ;(new Function(code))()
  //   })

  //   it('works', function () {
  //     console.log(global.window)
  //   })
  // })
})
