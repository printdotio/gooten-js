var grunt = require('grunt');
var banner = '/* <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %> licensed. <%= pkg.homepage %> */';

module.exports = {
    pkg: grunt.file.readJSON('package.json'),
    banner: banner,
    gtnfiles: grunt.file.readJSON('./src/assets/gtnfiles.json').files,
    locations: require('./locations')
};
