'use strict';

module.exports = function (grunt) {
  grunt.config('cssmin', {
    minify: {
      src: '<%= concat.css.dest %>',
      dest: '<%= locations.destMinifyCSS %>'
    },
    partner_css:{
      expand: true,
      cwd: 'assets/css/partners/',
      src: ['*.css', '!*.min.css'],
      dest: '<%= locations.destPartnerCSS %>',
      ext: '.min.css'
    }
  });
};
