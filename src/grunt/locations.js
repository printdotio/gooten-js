// This is a combination of the variables used during the .NET days with those created for the Go project. With some refactoring, we can clean out the former variables.
module.exports = {
    // Original variables
    destWidget: 'assets/dist/<%= pkg.name %>.<%= pkg.version %>.min.js',
    destEmbed: 'assets/dist/embed/pio.<%= pkg.version %>.min.js',
  destCanvas: 'assets/dist/pio.canvaspreviewer.<%= pkg.version %>.min.js',
  destEditor: 'assets/dist/pio.editor.<%= pkg.version %>.min.js',
    destMinifyCSS: 'assets/dist/<%= pkg.name %>.<%= pkg.version %>.min.css',
    destPartnerCSS: 'assets/dist/partners/',
    sprites: {
      x1: 'assets/dist/sprites.<%= pkg.version %>.png',
      x2: 'assets/dist/sprites.<%= pkg.version %>@2x.png'
    },

    // New variables
    assets: {
        dist: {
            widget: '<%= pkg.name %>.<%= pkg.version %>.min.js',
            embed: {
                pio: 'pio.<%= pkg.version %>.min.js',
                pioLatest: 'pio.latest',
            },
            minifyCSS: '<%= pkg.name %>.<%= pkg.version %>.min.css',
            partnerCSS: 'partners/',
            sprites: {
              x1: 'sprites.<%= pkg.version %>.png',
              x2: 'sprites.<%= pkg.version %>@2x.png'
            },
          canvas: 'pio.canvaspreviewer.<%= pkg.version %>.min.js',
          editor: 'pio.editor.<%= pkg.version %>.min.js',
        },
    },
};
