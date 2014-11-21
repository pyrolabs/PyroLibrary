module.exports = function(grunt) {
  var rootFolder = './src';
  grunt.registerTask('watch', ['watch']);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile:'test/karma.conf.js',
        autowatch: false,
        singleRun: true
      }
    },
    //Trying for storing variables else where,
    watch: {
      html: {
        files: [rootFolder + '/index.html'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['**/*.js'],
        options: {
          livereload: true
        }
      },
      css: {
        files: [rootFolder + '/css/style.css'],
        options: {
          livereload: true
        }
      }
    }
  });

  //Plugin for "watch"
  grunt.loadNpmTasks('grunt-contrib-watch');

  //Connect plugin
  grunt.loadNpmTasks('grunt-contrib-connect');

  //Open plugin
  grunt.loadNpmTasks('grunt-open');

  grunt.loadNpmTasks('grunt-karma');
  // Default task(s).
  grunt.registerTask('default', ['connect', 'watch']);
  
  grunt.registerTask('test', ['karma']);


  grunt.registerTask('serve', ['connect'], function() {
      grunt.task.run('connect');
  });
};
