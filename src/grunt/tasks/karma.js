'use strict';

module.exports = function (grunt) {
  grunt.config('karma', {
    options: {
      configFile: 'src/assets/karma.conf.js',
      runnerPort: 9999,
      singleRun: true,
      frameworks: ['jasmine-ajax','jasmine'],
      browserNoActivityTimeout: 999999
    },
    core: {},
  });
};
