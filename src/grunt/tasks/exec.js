'use strict';

var util = require('util');
var grunt = require('grunt');
var p = grunt.config.process;

function simple() {
    var command = util.format.apply(util, arguments);
    return {command: command};
}

module.exports = function (grunt) {
    grunt.config('exec', {
        latest: simple('cp %s %s', p('<%= locations.min %>'), p('<%= locations.latest %>'))
    });
};