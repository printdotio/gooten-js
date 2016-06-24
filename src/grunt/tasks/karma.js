'use strict';

module.exports = function (grunt) {
  grunt.config('karma', {
    options: {
      configFile: 'assets/js/core/karma.conf.js',
      runnerPort: 9999,
      singleRun: true,
      browsers: ['Chrome'],
      frameworks: ['jasmine-ajax','jasmine'],
      browserNoActivityTimeout: 999999
    },
    core: {},
    embed: {
      configFile: 'assets/js/embed/karma.conf.js'
    }
  });
};
