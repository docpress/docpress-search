const compile = require('../../')()

describe('index/basic:', function () {
  beforeEach(function (done) {
    // Mock metalsmith object
    var ms = {
      metadata () {
        return { docs: 'docs' }
      }
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

  beforeEach(function () {
    this.idx = this.files['_docpress.json'].searchIndex
  })

  it('renders', function () {
    expect(this.files['intro.html']).toExist()
  })

  it('has search indices', function () {
    expect(this.idx).toExist()
  })

  it('indexes the first page', function () {
    expect(this.idx['index.html']).toExist()
    expect(this.idx['index.html'].title).toEqual('My project')
    expect(this.idx['index.html'].pagetitle).toEqual('My project')
    expect(this.idx['index.html'].text).toEqual('Hello.')
  })

  it('indexes the first page\'s 1st heading', function () {
    expect(this.idx['index.html#usage']).toExist()
    expect(this.idx['index.html#usage'].title).toEqual('Usage')
    expect(this.idx['index.html#usage'].pagetitle).toEqual('My project')
    expect(this.idx['index.html#usage'].text).toEqual('Use it wisely')
  })
})
