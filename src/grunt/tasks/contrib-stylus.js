'use strict';

module.exports = function (grunt) {
  grunt.config('stylus', {
    web: {
      files: {
        'assets/css/dist/compiled.css':
        'assets/css/all.styl'
      },
      options: {
        'include css': true,
        compress: false
      }
    }
  });
};
