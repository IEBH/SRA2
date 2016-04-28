var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');

// Configure / Plugins {{{
requireDir('./gulp-tasks');
notify.logLevel(0);
// }}}

// Configure / Paths {{{
// All paths should be relative to the project root directory
global.paths = {
	root: __dirname + '/', // Root directory of the project
	ignore: [ // Do not monitor these paths for changes
		'app/', // No need to watch this with nodemon as its handled seperately
		'views/partials',
		'node_modules/',
		'build/',
		'data/',
		'test/',
	],
	scripts: [
		'app/**/*.js',
	],
	css: [
		'public/css/**/*.css',
	],
	partials: [
		'views/partials/**/*.html',
	],
	data: [
		'models/data/**/*.js'
	],
	scenarios: [
		'models/scenarios/**/*.json',
	],
	build: 'build',
	vendors: [
		// Vendor dependencies (all must follow the protocol://path format)
		// Dependencies maintain order so list pre-requisites first
		// Do not include minified files here! Minification happens automatically
		'file://node_modules/angular/angular.js',
		'npm://jquery',
		'npm://lodash',
		'file://node_modules/bootstrap/dist/css/bootstrap.css',
		'file://node_modules/bootstrap/dist/js/bootstrap.js',
		'npm://angular-async-chainable',
		'npm://angular-bootstrap-colorpicker',
		'npm://angular-bs-text-highlight',
		'npm://angular-bs-tooltip',
		'npm://angular-clipboard',
		'npm://angular-collection-assistant',
		'npm://angular-pretty-bytes',
		'file://node_modules/angular-resource/angular-resource.js',
		'npm://angular-ui-router',
		'npm://angular-ui-switch',
		'npm://angular-venn',
		'file://node_modules/angular-xeditable/dist/js/xeditable.js',
		'file://node_modules/angular-xeditable/dist/css/xeditable.css',
		'npm://d3',
		'file://node_modules/jquery-form/jquery.form.js',
		'file://node_modules/font-awesome/css/font-awesome.css', // NOTE: Font files are handled in controllers/vendors.js
		'npm://moment',
		'npm://smart-area',
		'npm://venn.js',
	],
};
// }}}

// Redirectors {{{
gulp.task('default', ['serve']);
gulp.task('clean', ['scripts:clean']);
gulp.task('db', ['scenario']);
gulp.task('deploy', ['pm2-deploy']);
gulp.task('serve', ['nodemon']);
gulp.task('start', ['pm2-start']);
gulp.on('stop', function() { process.exit(0) });

gulp.task('build', function(finish) {
	runSequence(
		['css', 'partials', 'scripts', 'vendors'],
		finish
	);
});
// }}}

// Loaders {{{
gulp.task('load:config', [], function(finish) {
	global.config = require('./config');
	finish();
});

gulp.task('load:db', ['load:config'], function(finish) {
	require('./config/db');
	finish();
});

gulp.task('load:models', ['load:db'], function(finish) {
	require('./models');
	finish();
});
// }}}

/**
* Launch a plain server without Nodamon
*/
gulp.task('server', ['build'], function() {
	require('./server.js');
});
// }}}
