// Karma configuration
// Generated on Mon Jul 25 2016 19:16:36 GMT+1000 (AEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha','chai'],


    // list of files / patterns to load in the browser
    files: [
			'./node_modules/jquery/dist/jquery.js',
			'./node_modules/angular/angular.js',
			'./node_modules/angular-mocks/angular-mocks.js',
			'./node_modules/lodash/lodash.js',
			'./node_modules/moment/moment.js',
			// --- packages with dependents below this line --- //
			'./node_modules/bootstrap/dist/css/bootstrap.css',
			'./node_modules/bootstrap/dist/js/bootstrap.js',
			// --- less important vendors below this line (alphabetical) --- //
			'./node_modules/angular-async-chainable/async-chainable.js',
			'./node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
			'./node_modules/angular-bs-text-highlight/angular-bs-text-highlight.js',
			'./node_modules/angular-bs-tooltip/angular-bs-tooltip.js',
			'./node_modules/angular-clipboard/angular-clipboard.js',
			'./node_modules/angular-collection-assistant/ng-collection-assistant.js',
			'./node_modules/angular-resource/angular-resource.js',
			'./node_modules/angular-ui-router/release/angular-ui-router.js',
			'./node_modules/angular-ui-switch/angular-ui-switch.{css,js}',
			'./node_modules/angular-venn/angular-venn.js',
			'./node_modules/angular-xeditable/dist/js/xeditable.js',
			'./node_modules/angular-xeditable/dist/css/xeditable.css',
			'./node_modules/d3/d3.js',
			'./node_modules/jquery-form/jquery.form.js',
			'./node_modules/filesize/lib/filesize.js',
			'./node_modules/font-awesome/css/font-awesome.css', // NOTE: Font files are handled in controllers/vendors.js
			'./node_modules/venn.js/venn.js',
			'./app/app.js',
			'./app/**/*.js',
			'./test/unit/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
