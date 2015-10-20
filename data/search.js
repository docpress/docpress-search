var lunr = require('lunr')

/**
 *     Search.search('foo')
 *     Search.lunr
 */

window.Search = (function () {
  var Search = {}

  Search.lunr = lunr.Index.load(window.__lunrindex)

  Search.search = function (keywords) {
    var results = Search.lunr.search(keywords)
    return results.map(function (result) {
      // result == { ref: 'index.html#usage', score: 0.99 }
      return window.__searchindex[result.ref]
    })
  }

  return Search
}())
