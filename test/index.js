"use strict";

/* eslint-env mocha */

var path = require("path");
var fs = require("fs");
var assert = require("assert");
var remark = require("remark");
var frontmatter = require("remark-frontmatter");
var vfile = require("vfile");
var vueRenderer = require("..");

var read = fs.readFileSync;
var write = fs.writeFileSync;
var exists = fs.existsSync;
var join = path.join;

/**
 * Check if `filePath` is hidden.
 *
 * @param {string} filePath
 * @return {boolean} - Whether or not `filePath` is hidden.
 */
function isHidden(filePath) {
  return filePath.indexOf(".") !== 0;
}

["v2.5"].forEach(function(vueVersion) {
  var Vue = require(path.join(__dirname, "vue", vueVersion));

  /*
   * Fixtures.
   */

  var FIXTURE_ROOT = join(__dirname, "vue", vueVersion, "fixtures");
  var fixtures = fs.readdirSync(FIXTURE_ROOT);
  fixtures = fixtures.filter(isHidden);

  /**
   * Shortcut to process.
   *
   * @param {File} file
   * @return {string}
   */
  async function processAsync(file, config) {
    var vdom = remark()
      .data("settings", config)
      .use(frontmatter, ["yaml"])
      .use(vueRenderer, config)
      .processSync(file).contents;
    var html = await Vue.renderToString(vdom);
    return html;
  }

  /**
   * Assert two strings.
   *
   * @param {string} actual
   * @param {string} expected
   * @param {boolean?} [silent]
   * @return {Error?} - When silent and not equal.
   * @throws {Error} - When not silent and not equal.
   */
  function assertion(actual, expected, silent) {
    try {
      assert(actual === expected);
    } catch (err) {
      err.expected = expected;
      err.actual = actual;

      if (silent) {
        return err;
      }

      throw err;
    }
  }

  /*
   * Tests.
   */

  describe("on Vue " + vueVersion, function() {
    describe("remark-vue()", function() {
      it("should be a function", function() {
        assert(typeof vueRenderer === "function");
      });

      it("should not throw if not passed options", function() {
        assert.doesNotThrow(function() {
          remark()
            .use(vueRenderer)
            .freeze();
        });
      });

      /*
      it("should use consistent Vue keys on multiple renders", function() {
        function extractKeys(vueElement) {
          var keys = [];

          if (vueElement.key != null) {
            keys = keys.concat(vueElement.key);
          }

          if (vueElement.props != null) {
            var childKeys = [];

            Vue.Children.forEach(vueElement.props.children, function(child) {
              childKeys = childKeys.concat(extractKeys(child));
            });

            keys = keys.concat(childKeys);
          }

          return keys;
        }

        function vueKeys(text) {
          var vdom = remark()
            .use(vueRenderer, { Vue: Vue })
            .processSync(text).contents;
          return extractKeys(vdom);
        }

        var markdown = "# A **bold** heading";
        var keys1 = vueKeys(markdown);
        console.log("VUE KEYS 1: ", keys1);
        var keys2 = vueKeys(markdown);
        console.log("VUE KEYS 2: ", keys2);

        assert.deepEqual(keys1, keys2);
      });
      */

      it("should use custom components", async function() {
        var markdown = "# Foo";

        var vdom = remark()
          .use(vueRenderer, {
            Vue: Vue,
            remarkVueComponents: {
              h1: "h2"
            }
          })
          .processSync(markdown).contents;

        var html = await Vue.renderToString(vdom);

        assert.equal(
          html,
          '<div data-server-rendered="true"><h2>Foo</h2></div>'
        );
      });

      it("does not sanitize input when `sanitize` option is set to false", async function() {
        var markdown = "```empty\n```";
        var vdom = remark()
          .use(vueRenderer, {
            Vue: Vue,
            sanitize: false
          })
          .processSync(markdown).contents;

        // If sanitation were done, 'class' property should be removed.
        var html = await Vue.renderToString(vdom, {});

        assert.equal(
          html,
          '<div data-server-rendered="true"><pre><code class="language-empty"></code></pre></div>'
        );
      });

      it("passes toHast options to inner toHAST() function", async function() {
        var markdown = "# Foo";

        var vdom = remark()
          .use(vueRenderer, {
            Vue: Vue,
            toHast: { allowDangerousHTML: true }
          })
          .processSync(markdown).contents;

        var html = await Vue.renderToString(vdom);

        assert.equal(
          html,
          '<div data-server-rendered="true"><h1>Foo</h1></div>'
        );
      });
    });

    /**
     * Describe a fixture.
     *
     * @param {string} fixture
     */
    function describeFixture(fixture) {
      it("should work on `" + fixture + "`", async function() {
        var filepath = join(FIXTURE_ROOT, fixture);
        var output = read(join(filepath, "output.html"), "utf-8");
        var input = read(join(filepath, "input.md"), "utf-8");
        var config = join(filepath, "config.json");
        var file = vfile({ path: fixture + ".md", contents: input });
        var result;

        config = exists(config) ? JSON.parse(read(config, "utf-8")) : {};
        config.Vue = Vue;
        result = await processAsync(file, config);

        if (global.process.env.UPDATE) {
          write(join(filepath, "output.html"), result);
        }

        assertion(
          result,
          '<div data-server-rendered="true">' + output + "</div>"
        );
      });
    }

    /*
     * Assert fixtures.
     */

    describe("Fixtures", function() {
      fixtures.forEach(describeFixture);
    });
  });
});
