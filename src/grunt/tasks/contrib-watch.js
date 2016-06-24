'use strict';

module.exports = function (grunt) {
  grunt.config('watch', {
    gruntfile: {
      files: '<%= jshint.gruntfile.src %>',
      tasks: ['jshint:gruntfile']
    },
    lib_test: {
      files: '<%= jshint.lib_test.src %>',
      tasks: ['jshint:lib_test', 'nodeunit']
    },
    debug: {
      files: ['assets/css/**/*.{css,styl}','!assets/css/dist/compiled.css'],
      tasks: ['css:debug']
    }
  });
};
