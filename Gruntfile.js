module.exports = function(grunt) {
    grunt.registerTask('watch', ['watch']);
    grunt.registerTask('dist', ['shell:home']);
    grunt.registerTask('test', ['shell:test']);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        connect: {
          server: {
            options: {
              port: 8080,
              //keepalive: true, keeping grunt running
              livereload:true,
              base: './app/',
              open: {
                target: 'http://localhost:8080',
                appName: 'Google Chrome',
              }
            }
          }
        },
        watch: {
          js: {
            files: ['**/*.js']
          },
          html:{
            files:['**/*.html'],
            options: {
              livereload: true
            }
          }
        },
        aws_s3:{
          options: {
            accessKeyId: '<%= config.AWSAccessKeyId %>', // Use the variables
            secretAccessKey: '<%= config.AWSSecretKey %>', // You can also use env variables
            region: 'US Standard',
            bucket:'pyro-labs',
            uploadConcurrency: 5, // 5 simultaneous uploads
            downloadConcurrency: 5 // 5 simultaneous downloads
          },
          {'action': 'upload', expand: true, cwd: 'dist/js', src: ['pyro.js'], dest: 'app/js/'}
        }

    });

    //Plugin for "watch"
    grunt.loadNpmTasks('grunt-contrib-watch');

    //Connect plugin
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Open plugin
    grunt.loadNpmTasks('grunt-open');

    // S3 File Handling Plugin (For uploading build)
    grunt.loadNpmTasks('grunt-aws-s3');

    // Default task(s).
    grunt.registerTask('default', ['connect', 'watch']);

    grunt.registerTask('build', ['aws_s3']);


    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};