'use strict';

module.exports = function (grunt) {
	grunt.config('jshint', {
    options: { jshintrc: '.jshintrc' },
    gruntfile: { src: 'Gruntfile.js' },
    lib_test: { src: ['lib/**/*.js', 'test/**/*.js'] }
  });
};
