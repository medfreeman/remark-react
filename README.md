# remark-vue

[![Build Status](https://travis-ci.org/medfreeman/remark-vue.svg?branch=master)](https://travis-ci.org/medfreeman/remark-vue) [![Greenkeeper badge](https://badges.greenkeeper.io/medfreeman/remark-vue.svg)](https://greenkeeper.io/)

**remark-vue** compiles markdown to Vue.  Built on [**remark**](https://github.com/remarkjs/remark),
an extensively tested and pluggable parser.

**Why?** Using `domPropsInnerHTML` in
[Vue.js](https://vuejs.org/) is a common cause of [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting)
attacks: user input can include script tags and other kinds of active
content that reaches across domains and harms security. remark-vue
builds a DOM in Vue, using [Vue createElement](https://vuejs.org/v2/guide/render-function.html#Nodes-Trees-and-the-Virtual-DOM):
this means that you can display parsed & formatted Markdown content
in an application without using `domPropsInnerHTML`.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install remark-vue
```

## Table of Contents

*   [Programmatic](#programmatic)

    *   [remark.use(vue, options)](#remarkusevue-options)

*   [Configuration](#configuration)

*   [Integrations](#integrations)

*   [License](#license)

## Programmatic

### [remark](https://github.com/wooorm/remark#api).[use](https://github.com/wooorm/remark#remarkuseplugin-options)(vue, [options](#configuration))

**Parameters**

*   `vue` — This plugin;
*   `options` (`Object?`) — See [below](#configuration).

Let’s say `example.js` looks as follows:

```js
var Vue = require('vue'),
    remark = require('remark'),
    vueRenderer = require('remark-vue');

var App = new Vue({
  el: '#app',
  data: function () {
    return {
      text: '# hello world'
    }
  },
  onChange(e) {
    this.text = e.target.value;
  },
  render() {
    return (<div>
      <textarea
        value={this.text}
        v-on:change={this.onChange} />
      <div id='preview'>
        { remark().use(vueRenderer).processSync(this.text).contents }
      </div>
    </div>);
  }
});
```

## Configuration

All options, including the `options` object itself, are optional:

*   `sanitize` (`object` or `boolean`, default: `undefined`)
    — Sanitation schema to use. Passed to
    [hast-util-sanitize](https://github.com/wooorm/hast-util-sanitize).
    The default schema, if none or `true` is passed, adheres to GitHub’s
    sanitation rules.

    **This means that non-standard HAST nodes and many
    HTML elements are *by default* santized out.** If you want to be more
    permissive, you should provide a value for `sanitize`.

    If `false` is passed, it does not sanitize input.

*   `prefix` (`string`, default: `''`)
    — Vue key.

*   `Vue` (`Function`, default: `require('vue')`)
    — Global Vue constructor.

*   `remarkVueComponents` (`object`, default: `undefined`)
    — Provides a way to override default elements (`<a>`, `<p>`, etc)
    by defining an object comprised of `element: Component` key-value
    pairs. For example, to output `<MyLink>` components instead of
    `<a>`, and `<MyParagraph>` instead of `<p>`:

    ```js
    remarkVueComponents: {
      a: MyLink,
      p: MyParagraph
    }
    ```

*   `toHast` (`object`, default: `{}`)
    — Provides options for transforming MDAST document to HAST.
    See [mdast-util-to-hast](https://github.com/wooorm/mdast-util-to-hast#api)
    for settings.

These can passed to `remark.use()` as a second argument.

## Integrations

**remark-vue** works great with:

*   [**remark-toc**](https://github.com/wooorm/remark-toc), which generates
    tables of contents;

*   [**remark-github**](https://github.com/wooorm/remark-github), which
    generates references to GitHub issues, PRs, users, and more;

*   ...and [more](https://github.com/wooorm/remark/blob/master/doc/plugins.md#list-of-plugins).

All [**remark** nodes](https://github.com/wooorm/mdast)
can be compiled to HTML.

In addition, **remark-vue** looks for an
`attributes` object on each node it compiles and adds the found properties
as HTML attributes on the compiled tag.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com), modified by [Tom MacWright](http://www.macwright.org/), [Mapbox](https://www.mapbox.com/).

Forked by [Med_freeman](https://medfreeman.io) to `remark-vue`.
