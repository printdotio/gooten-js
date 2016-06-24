'use strict';

var grunt = require('grunt');
var util = require('util');
var views = 'views/';
var cdn = '//az412349.vo.msecnd.net/widget-assets/';
var dist = 'assets/dist/';
var js = '<%= locations.destWidget %>';
var css = '<%= locations.destMinifyCSS %>';
var main = [views + 'widget.html'];
var head = [views + 'partials/head.html'];

function to (expression, format) {
  var path = grunt.config.process(expression);
  var file = cdn + path.replace(dist, '');
  return util.format(format, file);
}

function for_ (type, tpl, gzip) {
  var gz  = gzip ? 'gzip' : '';
  var gzx = gzip ? '.gzip' : '';
  var hint = type + gz;
  var text = util.format(tpl, '%s', gzx);
  return util.format('<!--min%s-->" }} %s {{ noescape "<!--min%s-->', hint, text, hint);
}

var for_js = for_.bind(null, 'js', '<script src="%s%s"></script>');
var for_css = for_.bind(null, 'css', '<link rel="stylesheet" type="text/css" href="%s%s" />');

function rex (key) {
  var fmt = "\<![ \r\n\t]*(--(%s)--[ \r\n\t]*)\>.*\<![ \r\n\t]*(--(%s)--[ \r\n\t]*)\>";
  return new RegExp(util.format(fmt, key, key), 'g');
}

module.exports = function (grunt) {
  grunt.config('replace', {
    alter_widget_html_js: {
      src: main,
      overwrite: true,
      replacements: [{ from: rex('minjs'), to: to(js, for_js()) }]
    },
    alter_widget_html_css: {
      src: head,
      overwrite: true,
      replacements: [{ from: rex('mincss'), to: to(css, for_css()) }]
    },
    alter_widget_html_js_gzip: {
      src: main,
      overwrite: true,
      replacements: [{ from: rex('minjsgzip'), to: to(js, for_js(true)) }]
    },
    alter_widget_html_css_gzip: {
      src: head,
      overwrite: true,
      replacements: [{ from: rex('mincssgzip'), to: to(css, for_css(true)) }]
    }
  });
};
