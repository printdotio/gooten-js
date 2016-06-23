'use strict';

module.exports = function (grunt) {
    grunt.config('uglify', {
        options: {
            banner: '<%= banner %>',
            stripBanners: true
        },
        gtn: {
            src: '<%= concat.gtn.dest %>',
            dest: '<%= locations.min %>'
        }
    });
};
