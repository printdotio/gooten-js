// Karma configuration
// Generated on Fri Nov 22 2013 10:07:27 GMT-0500 (Eastern Standard Time)
var fs = require('fs');
var file = JSON.parse(fs.readFileSync(__dirname + '/gtnfiles.json', 'utf8'));

module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',


        // frameworks to use
        frameworks: ['jasmine-ajax', 'jasmine'],


        // list of files / patterns to load in the browser
        files: ['../sinon-1.7.3.js'].concat(file.files.concat(file.tests)),


        // list of files to exclude
        exclude: [],


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['dots', 'junit', 'beep'],

        junitReporter: {
            outputFile: '../core-results.xml'
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        customLaunchers: {
          chrome_without_security: {
            base: 'Chrome',
            flags: ['--disable-web-security', '--ignore-ssl-errors=true'],
            displayName: 'Chrome w/o security'
          }
        },

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['chrome_without_security' /*'Chrome','IE'*/],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
