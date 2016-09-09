'use strict';

module.exports = function (grunt) {
    var gtnFiles = grunt.config.get('gtnfiles');
    
    grunt.config('concat', {
        options: {
            banner: '<%= banner %>',
            stripBanners: true
        },
        gtn: {
            src: gtnFiles.map(function (i) {
                return 'src/assets/' + i;
            }),
            dest: '<%= locations.gtn %>'
        }
    });
};
