# docpress-search

Search plugin for [docpress].

[docpress]: https://github.com/docpress/docpress

## Usage

Add me after `docpress-core` and before `docpress-base`.

## How

This plugin creates/updates the following artifacts:

* `assets/search.js` - JavaScript
* `_docpress.json` - adds `searchIndex` and `lunrIndex`.

It takes them from all `.html` files (which `docpress-core` converted from Markdown files) with the `$` attribute (assumed to be a Cheerio instance, left by `docpress-core`).

It also updates `ms.metadata()` to add `assets/search.js` to the `js` list.

It is meant to be used alongside `docpress-core` and `docpress-base`.

The frontend provides these available in the browser:

* `Search.search('keyword')` - searches pages and headings
* `Search.pages` - an index of all pages and headings
