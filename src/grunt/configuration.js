var grunt = require('grunt');
var banner = '/* <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %> licensed. <%= pkg.homepage %> */';

module.exports = {
  pkg: grunt.file.readJSON('package.json'),
  banner: banner,
  widgetfiles: grunt.file.readJSON('./assets/js/widgetfiles.json'),
  editorfiles: grunt.file.readJSON('./assets/js/editorfiles.json').files,
  canvasfiles: grunt.file.readJSON('./assets/js/canvas-previewer/files.json').src,
  locations: require('./locations'),

  env: {
      test: {
          AZURE_STORAGE_ACCOUNT: "piojoshtest",
          AZURE_STORAGE_ACCESS_KEY: "ZKUP34aExLkz8ZBAqcMWBcT2A9B330Eh9L/rIWrKL4TUGkObfSq+WZbUAuWkFfXNIiWfcbNkRk80dn7K6M810A==",
          CONTAINER_NAME: 'widget-assets',
      },
      dev: {
          AZURE_STORAGE_ACCOUNT: "printmeeappassets",
          AZURE_STORAGE_ACCESS_KEY: "/dSENJ+ZeP+5wFq2QgFXvjAO+Mu51b/gq0IoFHytV0yiRj5rY7hYI4jFQyegz5B0G5V4gWGuggAiC3KjNppxdQ==",
          CONTAINER_NAME: 'widget-assets-go',
      },
      prod: {
          AZURE_STORAGE_ACCOUNT: "printmeeappassets",
          AZURE_STORAGE_ACCESS_KEY: "/dSENJ+ZeP+5wFq2QgFXvjAO+Mu51b/gq0IoFHytV0yiRj5rY7hYI4jFQyegz5B0G5V4gWGuggAiC3KjNppxdQ==",
          CONTAINER_NAME: 'widget-assets',
      }
  },

  partners: {
      'hellopics': {
          'version': '1.0.0',
      },
      '500px': {
          'version': '1.0.0',
      },
      'pb': {
          'version': '2.0.15',
      },
      'snapyeti': {
          'version': '1.1.0',
      },
  }
};
