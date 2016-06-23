'use strict';

var _ = require('lodash');
var util = require('util');
var grunt = require('grunt');

var p = grunt.config.process;

/* 
 * A simple wrapper to return a command for exec to execute. If the command is a no op, simple returns true.
 */
function simple () {
  var command = util.format.apply(util, arguments) 
  return { command: command };
}

module.exports = function (grunt) {
  
  // Parsing our location variables in
  var destWidget = p('<%= locations.destWidget %>');
  var destEmbed = p('<%= locations.destEmbed %>');
  var destMinifyCSS = p('<%= locations.destMinifyCSS %>');
  var destPartnerCSS = p('<%= locations.destPartnerCSS %>');
  var dist = 'assets/dist/';
  var pioLatest = dist + 'embed/GTN.latest.v2.js';
  var pioLatestForUpload = dist + 'embed/GTN.latest-v2.js'; // TODO: what is this contraption?
  var pioClassicUpload = dist + 'embed/GTN.latest.js'; // TODO: what is this contraption?

  grunt.config('exec', {
    make_widget_latest_js: simple('cp %s %s', destWidget, dist + 'printio_widget.latest.js'),
    make_embed_latest_js: simple('cp %s %s', destEmbed, pioLatest),
    gzip_widget_js: simple('gzip < %s > %s.gzip', destWidget, destWidget),
    gzip_css: simple('gzip < %s > %s.gzip', destMinifyCSS, destMinifyCSS),
    copy_legacy_js: simple('cp %s %s && cp %s %s', pioLatest, pioLatestForUpload, pioLatest, pioClassicUpload), 
  });

};
