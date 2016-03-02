module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        globals: {
          jQuery: true
        }
      },
      dist: ['src/js/*.js']
    },
    imagemin: {
      options: {
        optimizationLevel: 6
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.{png,jpg,jpeg,gif}'],
          dest: '.'
        }]
      }
    },
    htmlmin: {
      options: {
          removeComments: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          collapseBooleanAttributes: true,
          removeTagWhitespace: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          caseSensitive: true,
          minifyJS: true,
          minifyCSS: true
      },
      dist: {
        files: {
          'index.html': 'index.html'
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.{css,js,html,pdf}'],
            dest: '.'
          }
        ]
      }
    },
    useref: {
      html: 'index.html',
      temp: '.'
    },
    clean: ['css/', 'js/']
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-useref');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('build', ['copy', 'useref', 'concat', 'uglify', 'cssmin', 'htmlmin']);
  grunt.registerTask('default', ['jshint', 'build', 'clean']);
  grunt.registerTask('all', ['default', 'imagemin']);

};
