'use strict';

module.exports = function (grunt) {
  grunt.config('sprite', {
    regular: {
      src: ['assets/images/sprites/**/!(*@2x).png'],
      dest: '<%= locations.sprites.x1 %>',
      destCss: 'assets/css/generated/sprites.styl',
      imgPath: '//az412349.vo.msecnd.net/widget-assets/sprites.<%= pkg.version %>.png',
      cssVarMap: function (sprite) {
        sprite.name = 's-' + sprite.name;
      }
    },
    retina: {
      src: ['assets/images/sprites/**/*@2x.png'],
      dest: '<%= locations.sprites.x2 %>',
      destCss: 'assets/css/generated/sprites-2x.styl',
      imgPath: '//az412349.vo.msecnd.net/widget-assets/sprites.<%= pkg.version %>@2x.png',
      cssVarMap: function (sprite) {
        sprite.name = 's-' + sprite.name.replace(/@/g, '-');
      },
    },
    options: {
      cssFormat: 'stylus',
      algorithm: 'binary-tree'
    }
  });
};
