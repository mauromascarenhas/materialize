const path = require('path');
const sass = require('sass');
const webpackConfig = require('./webpack.config.js');

module.exports = function(grunt) {
  // configure the tasks
  const config = {
    jasmine: {
      components: {
        src: ['bin/materialize.js'],
        options: {
          vendor: ['node_modules/jquery/dist/jquery.min.js'],
          styles: 'bin/materialize.css',
          specs: 'tests/spec/**/*Spec.js',
          helpers: 'tests/spec/helper.js',
          keepRunner: true,
          version: '3.8.0',
          page: {
            viewportSize: {
              width: 1400,
              height: 735
            }
          },
          sandboxArgs: {
            args: ['--headless', '--no-sandbox']
          }
        }
      }
    },

    sass: {
      // Global options
      options: {
        implementation: sass
      },
      // Task
      expanded: {
        // Target options
        options: {
          outputStyle: 'expanded',
          sourcemap: false
        },
        files: {
          'dist/css/materialize.css': 'sass/materialize.scss',
          'dist/css/materialize-colors.css': 'sass/materialize-colors.scss'
        }
      },

      min: {
        options: {
          outputStyle: 'compressed',
          sourcemap: false
        },
        files: {
          'dist/css/materialize.min.css': 'sass/materialize.scss',
          'dist/css/materialize-colors.min.css': 'sass/materialize-colors.scss'
        }
      },

      // Compile ghpages css
      gh: {
        options: {
          outputStyle: 'compressed',
          sourcemap: false
        },
        files: {
          'docs/css/ghpages-materialize.css': 'sass/ghpages-materialize.scss'
        }
      },

      // Compile bin css
      bin: {
        options: {
          outputStyle: 'expanded',
          sourcemap: false
        },
        files: {
          'bin/materialize.css': 'sass/materialize.scss',
          'bin/materialize-colors.css': 'sass/materialize-colors.scss'
        }
      }
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: [
              'last 2 versions',
              'Chrome >= 30',
              'Firefox >= 30',
              'ie >= 10',
              'Safari >= 8'
            ]
          })
        ]
      },
      expanded: {
        files: [
          { src: 'dist/css/materialize.css' },
          { src: 'dist/css/materialize-colors.css' },
        ]
      },
      min: {
        files: [
          { src: 'dist/css/materialize.min.css' },
          { src: 'dist/css/materialize-colors.min.css' },
        ]
      },
      gh: {
        src: 'docs/css/ghpages-materialize.css'
      },
      bin: {
        files: [
          { src: 'bin/materialize.css' },
          { src: 'bin/materialize-colors.css' },
        ]
      }
    },

    webpack: {
      options: {
        /*stats: !process.env.NODE_ENV || process.env.NODE_ENV === "development",*/
      },

      dev: Object.assign({}, webpackConfig, {
        mode: 'development'
      }),

      dev_watch: Object.assign({}, webpackConfig, {
        mode: 'development',
        watch: true,
      }),
      
      dev_dist: Object.assign({}, webpackConfig, {
        mode: 'development',
        devtool: false,
        optimization: {
          minimize: false
        },
        output: {
          filename: 'materialize.js',
          path: path.resolve(__dirname, 'dist/js'),
          libraryTarget: 'umd',        
          globalObject: 'this'          
        }
      }),

      prod_min: Object.assign({}, webpackConfig, {
        mode: 'production',
        devtool: 'source-map',
        optimization: {
          minimize: true
        },
        output: {
          filename: 'materialize.min.js',
          path: path.resolve(__dirname, 'dist/js'),
          libraryTarget: 'umd',
          globalObject: 'this'
        }
      }),
    },       

    browserSync: {
      bsFiles: ['bin/*', 'css/ghpages-materialize.css', '!**/node_modules/**/*'],
      options: {
        server: {
          baseDir: './docs/' // make server from root dir
        },
        port: 8000,
        ui: {
          port: 8080,
          weinre: {
            port: 9090
          }
        },
        open: false
      }
    },

    compress: {
      main: {
        options: {
          archive: 'bin/materialize.zip',
          level: 6
        },
        files: [
          { expand: true, cwd: 'dist/', src: ['**/*'], dest: 'materialize/' },
          { expand: true, cwd: './', src: ['LICENSE', 'README.md'], dest: 'materialize/' }
        ]
      },

      src: {
        options: {
          archive: 'bin/materialize-src.zip',
          level: 6
        },
        files: [
          { expand: true, cwd: 'sass/', src: ['materialize.scss'], dest: 'materialize-src/sass/' },
          { expand: true, cwd: 'sass/', src: ['materialize-colors.scss'], dest: 'materialize-src/sass/' },
          { expand: true, cwd: 'sass/', src: ['components/**/*'], dest: 'materialize-src/sass/' },
          { expand: true, cwd: 'src/',  src: ['**/*'], dest: 'materialize-src/ts/' },
          { expand: true, cwd: 'dist/js/', src: ['**/*'], dest: 'materialize-src/js/bin/' },
          { expand: true, cwd: './', src: ['LICENSE', 'README.md'], dest: 'materialize-src/' }
        ]
      },

      starter_template: {
        options: {
          archive: 'templates/starter-template.zip',
          level: 6
        },
        files: [
          { expand: true, cwd: 'dist/', src: ['**/*'], dest: 'starter-template/' },
          {
            expand: true,
            cwd: 'templates/starter-template/',
            src: ['index.html', 'LICENSE'],
            dest: 'starter-template/'
          },
          {
            expand: true,
            cwd: 'templates/starter-template/css',
            src: ['style.css'],
            dest: 'starter-template/css'
          },
          {
            expand: true,
            cwd: 'templates/starter-template/js',
            src: ['init.js'],
            dest: 'starter-template/js'
          }
        ]
      },

      parallax_template: {
        options: {
          archive: 'templates/parallax-template.zip',
          level: 6
        },
        files: [
          { expand: true, cwd: 'dist/', src: ['**/*'], dest: 'parallax-template/' },
          {
            expand: true,
            cwd: 'templates/parallax-template/',
            src: ['index.html', 'LICENSE', 'background1.jpg', 'background2.jpg', 'background3.jpg'],
            dest: 'parallax-template/'
          },
          {
            expand: true,
            cwd: 'templates/parallax-template/css',
            src: ['style.css'],
            dest: 'parallax-template/css'
          },
          {
            expand: true,
            cwd: 'templates/parallax-template/js',
            src: ['init.js'],
            dest: 'parallax-template/js'
          }
        ]
      }
    },

    pug: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: [{
          expand: true,
          cwd: 'pug/',
          src: ['*.pug', '!**/pug/includes/*.*'],
          dest: 'docs/',
          rename: function (dest, src) {
            return dest + src.split('.', 2)[0] + '.html';
          }
        }]
      }
    },

    watch: {
      pug: {
        files: ['pug/**/*'],
        tasks: ['pug_compile'],
        options: {
          interrupt: false,
          spawn: false
        }
      },
      copydocs: {
        files: ['bin/*.js'],
        tasks: ['copy:docs_js'],
        options: {
          interrupt: false,
          spawn: false
        }
      },
      sass: {
        files: ['sass/**/*'],
        tasks: ['sass_compile'],
        options: {
          interrupt: false,
          spawn: false
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 10
      },
      monitor: {
        tasks: [
          'webpack:dev_watch',
          'pug_compile',
          'sass_compile',
          'watch:pug',
          'watch:sass',
          'watch:copydocs',
          'server'
        ]
      }
    },

    // Replace text to update the version string
    replace: {
      version: {
        src: ['bower.json', 'package.js', 'pug/**/*.html', 'pug/includes/_navbar.pug', 'src/global.ts'],
        overwrite: true,
        replacements: [
          {
            from: grunt.option('oldver'),
            to: grunt.option('newver')
          }
        ]
      },
      package_json: {
        src: ['package.json'],
        overwrite: true,
        replacements: [
          {
            from: '"version": "' + grunt.option('oldver'),
            to: '"version": "' + grunt.option('newver')
          }
        ]
      },
      docs: {
        src: ['.gitignore'],
        overwrite: true,
        replacements: [
          {
            from: '/docs/*.html',
            to: ''
          }
        ]
      }
    },

    // Create Version Header for files
    usebanner: {
      release: {
        options: {
          position: 'top',
          banner:
            '/*!\n * Materialize v' +
            grunt.option('newver') +
            ' (https://materializecss.github.io/materialize)\n * Copyright 2014-' +
            new Date().getFullYear() +
            ' Materialize\n * MIT License (https://raw.githubusercontent.com/materializecss/materialize/master/LICENSE)\n */',
          linebreak: true
        },
        files: {
          src: ['dist/css/*.css', 'dist/js/*.js']
        }
      }
    },

    rename: {
      rename_src: {
        src: 'bin/materialize-src.zip',
        dest: 'bin/materialize-src-v' + grunt.option('newver') + '.zip',
        options: {
          ignore: true
        }
      },
      rename_compiled: {
        src: 'bin/materialize.zip',
        dest: 'bin/materialize-v' + grunt.option('newver') + '.zip',
        options: {
          ignore: true
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          protocol: 'http',
          middleware: function(connect, options, middlewares) {
            middlewares.unshift(function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Credentials', true);
              res.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
              );
              res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
              next();
            });
            return middlewares;
          }
        }
      }
    },

    copy: {
      docs_js: {
        files: [{ src: 'bin/materialize.js', dest: 'docs/js/materialize.js' }]
      },
      docs_templates: {
        files: [{ src: 'templates/**', dest: 'docs/' }]
      }
    }
  };

  grunt.initConfig(config);

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-rename-util');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // define tasks
  grunt.registerTask('release', [
    'replace:version', // before webpack
    'sass:expanded',
    'sass:min',
    'postcss:expanded',
    'postcss:min',
    'webpack:dev_dist',
    'webpack:prod_min',
    'usebanner:release',
    'compress:main',
    'compress:src',
    'compress:starter_template',
    'compress:parallax_template',
    'replace:version', // again because of cdn
    'replace:package_json',
    'rename:rename_src',
    'rename:rename_compiled',
  ]);  
  grunt.registerTask('pug_compile', ['pug']);
  grunt.registerTask('js_compile', ['webpack:dev', 'copy:docs_js']);
  grunt.registerTask('sass_compile', ['sass:gh', 'sass:bin', 'postcss:gh', 'postcss:bin']);
  grunt.registerTask('server', ['browserSync']);
  grunt.registerTask('monitor', ['concurrent:monitor']); // DEV
  grunt.registerTask('test', ['js_compile', 'sass_compile', 'connect', 'jasmine']);
  grunt.registerTask('jas_test', ['connect', 'jasmine']);
  grunt.registerTask('test_repeat', function() {
    const tasks = ['connect'];
    const n = 30;
    for (let i = 0; i < n; i++) {
      tasks.push('jasmine');
    }
    grunt.task.run(tasks);
  });
  grunt.registerTask('docs', [
    'js_compile',
    'copy:docs_js',
    'copy:docs_templates',
    'sass:gh',
    'postcss:gh',
    'pug',
    'replace:docs'
  ]);
};
