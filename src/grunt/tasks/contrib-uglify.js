'use strict';

module.exports = function (grunt) {
  grunt.config('uglify', {
    options: {
      banner: '<%= banner %>'
    },
    widget: {
      src: '<%= concat.widget.dest %>',
      dest: '<%= locations.destWidget %>'
    },
    embed: {
      src: '<%= concat.embed.dest %>',
      dest: '<%= locations.destEmbed %>'
    },
    canvas: {
      src: '<%= concat.canvas.dest %>',
      dest: '<%= locations.destCanvas %>'
    },
    editor: {
      src: '<%= concat.editor.dest %>',
      dest: '<%= locations.destEditor %>'
    }
  });
};
