module.exports = function(grunt) {
    grunt.registerTask('watch', ['watch']);
    grunt.registerTask('stage', ['jsdoc', 'uglify', 'aws_s3:staging', 'aws_s3:stageDocs'])

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        connect: {
          dev: {
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.devFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          },
          stage:{
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.distFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          }
        },
        watch: {
          js: {
            files: ['<%= config.devFolder %>/pyro.js'],
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
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/', src: ['pyro.min.js'], dest: 'library/<%= pkg.version %>'},
              {'action': 'upload', expand: true, cwd: '<%= config.devFolder %>/', src: ['pyro.js'], dest: 'library/<%= pkg.version %>'},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/docs', src: ['**'], dest: 'library/<%= pkg.version %>/docs', differential:true},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/', src: ['pyro.min.js'], dest: 'library/current'},
              {'action': 'upload', expand: true, cwd: '<%= config.devFolder %>/', src: ['pyro.js'], dest: 'library/current'},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/docs', src: ['**'], dest: 'library/current/docs', differential:true}
            ]
          },
          stage:{
            options: {
              accessKeyId: '<%= config.AWSAccessKeyId %>',
              secretAccessKey: '<%= config.AWSSecretKey %>',
              bucket:'pyro-cdn',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/', src: ['pyro.min.js'], dest: 'library/staging'},
              {'action': 'upload', expand: true, cwd: '<%= config.devFolder %>/', src: ['pyro.js'], dest: 'library/staging'},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/docs', src: ['**'], dest: 'library/staging/docs', differential:true}
            ]
          },
          stageDocs:{
            options: {
              accessKeyId: '<%= config.AWSAccessKeyId %>',
              secretAccessKey: '<%= config.AWSSecretKey %>',
              bucket:'pyro-cdn',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/docs', src: ['**'], dest: 'library/staging/docs', differential:true}
            ]
          }
        },
        copy: {
          dist: {
            files: [
              {expand: true, cwd: './<%= config.devFolder %>/', src:'pyro.js', dest: '<%= config.distFolder %>/'},
              {expand: true, cwd: './<%= config.devFolder %>/docs', src:'**', dest: '<%= config.distFolder %>/docs'},

            ],
          },
        },
        uglify:{
          dist:{
            files:{
              '<%= config.distFolder %>/pyro.min.js': ['<%= config.devFolder %>/pyro.js']
            }
          }
        },
        htmlmin: {
          dist: {
            options: {
              removeComments: true,
              collapseWhitespace: true
            },
            files: [{expand:true, cwd:'<%= config.devFolder %>', src:'index.html', dest:'<%= config.distFolder %>/'}]
          }
        },
        jsdoc: {
          dev:{
            src: ['<%= config.devFolder %>/pyro.js'],
            options: {
              destination: '<%= config.devFolder %>/docs',
              template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
              configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
          }
        },
        bump:{
          options:{
            files:['package.json'],
            updateConfigs:['pkg'],
            commit:true,
            commitMessage:'[RELEASE] Release v%VERSION%',
            commitFiles:['-a'],
            createTag:true,
            tagName:'v%VERSION%',
            push:true,
            pushTo:'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
            globalReplace: false
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

    //Uglify/Minify
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Auto documentation
    grunt.loadNpmTasks('grunt-jsdoc');

    //Auto Versioning
    grunt.loadNpmTasks('grunt-bump');

    // Minify HTML
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // Copy Dev version to dist folder
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', [ 'connect:dev', 'watch']);

    /* Builds minified script and creates documentation
      @task
    */
    grunt.registerTask('build', ['jsdoc', 'uglify', 'htmlmin', 'copy']);

    grunt.registerTask('docs', ['jsdoc', 'aws_s3:stageDocs']);

    grunt.registerTask('test', ['jsdoc', 'uglify', 'htmlmin', 'copy', 'connect:stage', 'watch']);


    grunt.registerTask('stage', ['jsdoc', 'uglify', 'htmlmin', 'copy', 'aws_s3:stage']);


    grunt.registerTask('release', ['bump-only:prerelease','stage', 'bump-commit', 'aws_s3:production']);


    grunt.registerTask('serve', ['connect:dev'], function() {
        grunt.task.run('connect');
    });
};
