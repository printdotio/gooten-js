'use strict';

module.exports = function (grunt) {
    
    grunt.initConfig(require('./src/grunt/configuration'));
    
    grunt.loadNpmTasks('grunt-env');
    
    grunt.loadTasks('src/grunt/tasks');
    
    require('load-grunt-tasks')(grunt);
    
    grunt.registerTask('dev', ['clean', 'concat:gtn']);
    
    grunt.registerTask('default', ['dev']);
    
    grunt.registerTask('release', ['clean', 'concat:gtn', 'uglify:gtn', 'exec:latest']);
};