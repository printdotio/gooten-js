'use strict';

var grunt = require('grunt');
var azure = require('azure-storage');

module.exports = function (grunt) {

  // Multifunctions as a dictionary for:
  // 1. Humans
  // 2. Grunt, to pass the task down to azure-blob
  grunt.config('upload_assets', {
    widget: {},
    widget_css: {},
    embed_latest: {},
    embed_latest_all: {},
    canvas: {},
    editor:{},
    images: {},
    sprites: {},
    hellopics_css: {},
    '500px_css': {},
    photobucket_css: {},
    snapyeti_css: {},
    // single: {},
  });

  grunt.config('azure-blob', {
    options: { // global options applied to each task
      containerName: grunt.option('container_name') || process.env.CONTAINER_NAME || 'widget-assets',
      containerDelete: false,
      metadata: {cacheControl: 'public,max-age=31556926'}, // max-age 1 year for all entries
      gzip: true,
      copySimulation: false  // set true: only dry-run what copy would look like
    },
    widget: {
      files: [{
        expand: true,
        cwd: 'assets/dist',
        dest: '',
        src: '<%= locations.assets.dist.widget %>',
        rename: function(dest, src) {
            return dest + src + '.gzip';
        },
      }],
      options: {
      },
    },
    widget_css: {
      files: [{
        expand: true,
        cwd: 'assets/dist',
        dest: '',
        src: '<%= locations.assets.dist.minifyCSS %>',
        rename: function(dest, src) {
            return dest + src + '.gzip';
        },
      }]
    },
    embed_latest: {
      files: [{
        expand: true,
        cwd: 'assets/dist/embed',
        dest: '',
        src: ['<%= locations.assets.dist.embed.pioLatest %>.js'],
      }],
      options: {
        containerName: grunt.option('container_name') || 'pio',
        metadata: {cacheControl: 'public,max-age=1000'},
      },
    },
    embed_latest_all: {
      files: [{
        expand: true,
        cwd: 'assets/dist/embed',
        dest: '',
        src: ['<%= locations.assets.dist.embed.pioLatest %>*.js'],
      }],
      options: {
        containerName: grunt.option('container_name') || 'pio',
        metadata: {cacheControl: 'public,max-age=1000'},
      },
    },
    canvas: {
      files: [{
        expand: true,
        cwd: 'assets/dist',
        dest: '',
        src: ['<%= locations.assets.dist.canvas %>*'],
      }],
      options: {
        containerName: grunt.option('container_name') || 'pio',
        metadata: {cacheControl: 'public,max-age=1000'},
      },
    },
    editor: {
      files: [{
        expand: true,
        cwd: 'assets/dist',
        dest: '',
        src: ['<%= locations.assets.dist.editor %>*'],
      }],
      options: {
        containerName: grunt.option('container_name') || 'pio',
        metadata: {cacheControl: 'public,max-age=1000'},
      },
    },
    images: {
      files: [{
        expand: true,
        flatten: true,
        cwd: 'assets/images/',
        dest: '',
        //src: ['**/*.gif', '**/*.png'],
        src: [
            'sprites/CanvasWrap/overlay.png',
            'sprites/CanvasWrap/overlay@2x.png',
            'gifs/anim-effects@2x.gif',
            'gifs/anim-grid@2x.gif',
            'gifs/anim-num@2x.gif',
            'gifs/anim-options@2x.gif',
            'gifs/anim-rotate@2x.gif',
            'gifs/anim-text@2x.gif',
            'gifs/loader.v2.gif',
            'gifs/icon-effects-purple@2x.png',
            'gifs/icon-grid-green@2x.png',
            'gifs/icon-options-dark@2x.png',
            'gifs/icon-rotate-green@2x.png',
            'gifs/icon-text-red@2x.png',
            'partners/photobucket/progress-blue.png',
            'partners/photobucket/progress-blue@2x.png',
            'partners/photobucket/pb-loading.gif',
            'partners/photobucket/icon-checkmark-blue.png',
            'partners/photobucket/icon-checkmark-blue@2x.png'
        ],
      }],
      options: {
        containerName: grunt.option('container_name') || 'widget-assets',
        metadata: {cacheControl: 'public,max-age=1000'},
      },
    },
    sprites: {
      files: [{
        expand: true,
        cwd: 'assets/dist',
        dest: '',
        src: ['<%= locations.assets.dist.sprites.x1 %>', '<%= locations.assets.dist.sprites.x2 %>'],
      }],
    },
    hellopics_css: {
      files: [{
        expand: true,
        cwd: 'assets/dist/partners',
        dest: '',
        src: 'hellopics.min.css',
        rename: function(dest, src) {
            var hellopics = grunt.config.process('<%= partners.hellopics %>');
            return dest + 'hellopics.min.' + hellopics.version + '.css.gzip';
        }
      }],
    },
    '500px_css': {
      files: [{
        expand: true,
        cwd: 'assets/dist/partners',
        dest: '',
        src: '500px.min.css',
        rename: function(dest, src) {
            var _500px = grunt.config.process('<%= partners.500px %>');
            return dest + '500px.min.' + _500px.version + '.css.gzip';
        }
      }],
    },
    photobucket_css: {
      files: [{
        expand: true,
        cwd: 'assets/dist/partners',
        dest: '',
        src: 'pb.min.css',
        rename: function(dest, src) {
            var photobucket = grunt.config.process('<%= partners.pb %>');
            return dest + 'pb.min.' + photobucket.version + '.css.gzip';
        }
      }],
    },
    snapyeti_css: {
      files: [{
        expand: true,
        cwd: 'assets/dist/partners',
        dest: '',
        src: 'snapyeti.min.css',
        rename: function(dest, src) {
            var snapyeti = grunt.config.process('<%= partners.snapyeti %>');
            return dest + 'snapyeti.min.' + snapyeti.version + '.css.gzip';
        }
      }],
    },
    // This one doesn't work yet.
    // single: {
    //   files: [{
    //     expand: true,
    //     flatten: true,
    //     cwd: '',
    //     dest: '',
    //     src: grunt.option('file'),
    //   }],
    // },

  });

};


grunt.registerMultiTask('upload_assets', 'A wrapper to set the environment', function(){
    var env = grunt.option('env') || 'dev';
    var child_task = this.nameArgs.replace(this.name, 'azure-blob');
    grunt.task.run(['env:' + env, child_task]);
});;
