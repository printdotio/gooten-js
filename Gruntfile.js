'use strict';

module.exports = function (grunt) {

  grunt.initConfig(require('./grunt/configuration'));

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-azure-blob');

  grunt.loadTasks('grunt/tasks');

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    
  ]);

  grunt.registerTask('editor-build',['clean','concat:editor','uglify:editor']);
  grunt.registerTask('editor-upload',['upload_assets:editor']);

};
