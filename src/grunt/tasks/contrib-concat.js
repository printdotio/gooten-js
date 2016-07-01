'use strict';

function prefix (files) {
	return files.map(function (i) {
		return 'assets/js/core/' + i;
	});
}

function canvas_prefix (files) {
  return files.map(function (i) {
    return 'assets/js/canvas-previewer/' + i;
  });
}

module.exports = function (grunt) {
	var widgetfiles = grunt.config.get('widgetfiles');

  var canvasFiles = grunt.config.get('canvasfiles');
  var editorFiles = grunt.config.get('editorfiles');

	grunt.config('concat', {
    options: {
      banner: '<%= banner %>',
      stripBanners: true
    },
    css:{
      src: [
        'assets/css/dist/compiled.css',
        'assets/css/jqvmap.css',
      ],
      dest:'assets/dist/<%= pkg.name %>.<%= pkg.version %>.css'
    },
    embed:{
      src: ['assets/js/embed/src/GTN.js'],
      dest:'assets/dist/embed/GTN.<%= pkg.version %>.js'
    },
    widget: {
      src: prefix(widgetfiles.widgetsrc.concat(widgetfiles.widgetsrc2)),
      dest: 'assets/dist/<%= pkg.name %>.<%= pkg.version %>.js'
    },
    canvas: {
      src: canvas_prefix(widgetfiles.widgetsrc.concat(canvasFiles)),
      dest: 'assets/dist/GTN.canvaspreviewer.<%= pkg.version %>.js'
    },
    editor: {
      src: prefix(editorFiles),
      dest: 'assets/dist/GTN.editor.<%= pkg.version %>.js'
    }
  });
};
