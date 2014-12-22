module.exports = function(grunt) {
    grunt.registerTask('watch', ['watch']);
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
              base: 'index.html',
              open: {
                target: 'http://localhost:8080',
                appName: 'Google Chrome',
              }
            }
          }
        },
        watch: {
          js: {
            files: ['dev/pyro.js'],
            tasks:['jsdoc'],
            options:{
              livereload:{
                port:35739
              },
            }
          }
        },
        aws_s3:{
          production:{
            options: {
              accessKeyId: '<%= config.AWSAccessKeyId %>', 
              secretAccessKey: '<%= config.AWSSecretKey %>', 
              bucket:'pyro-cdn',
              uploadConcurrency: 2
            },
            files:[
              {'action': 'upload', expand: true, cwd: 'dist/', src: ['pyro.min.js'], dest: '<%= pkg.version %>'}, 
              {'action': 'upload', expand: true, cwd: 'dev/', src: ['pyro.js'], dest: '<%= pkg.version %>'},
            ]
          },
          staging:{
            options: {
              accessKeyId: '<%= config.AWSAccessKeyId %>',
              secretAccessKey: '<%= config.AWSSecretKey %>', 
              bucket:'pyro-cdn',
              uploadConcurrency: 2
            },
            files:[
              {'action': 'upload', expand: true, cwd: 'dist/', src: ['pyro.min.js'], dest: 'staging/<%= pkg.version %>'}, 
              {'action': 'upload', expand: true, cwd: 'dev/', src: ['pyro.js'], dest: 'staging/<%= pkg.version %>'}            ]
          },
          docs:{
            options: {
              accessKeyId: '<%= config.AWSAccessKeyId %>', // Use the variables
              secretAccessKey: '<%= config.AWSSecretKey %>', // You can also use env variables
              bucket:'pyro-labs',
              uploadConcurrency: 50, // 50 simultaneous uploads
            },
            files:[
              {'action': 'upload', expand: true, cwd: 'dist/docs', src: ['**'], dest: 'docs', differential:true}
            ]
          }
        },
        uglify:{
          my_target:{
            files:{
              'dist/pyro.min.js': ['dev/pyro.js']
            }
          }
        },
        jsdoc: {
          dist:{
            src: ['dev/pyro.js'], 
            options: {
              destination: 'dist/docs',
              template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
              configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
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

    // S3 File Handling Plugin (For uploading build)
    grunt.loadNpmTasks('grunt-aws-s3');

    //Uglify
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    // JSDoc
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', [ 'watch']);
    /* Builds minified script and creates documentation
      @task
    */
    grunt.registerTask('build', ['uglify', 'jsdoc']);
    
    grunt.registerTask('docs', ['jsdoc']);
    
    grunt.registerTask('stage', ['jsdoc', 'uglify', 'aws_s3:staging', 'aws_s3:docs'])

    grunt.registerTask('publish', ['jsdoc', 'uglify', 'aws_s3:production', 'aws_s3:docs']);


    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};