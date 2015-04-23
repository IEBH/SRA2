var _ = require('lodash');
var concat = require('gulp-concat');
var del = require('del');
var exec = require('child_process').exec;
var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var replace = require('gulp-replace');
var requireDir = require('require-dir');
var sourcemaps = require('gulp-sourcemaps');

global.paths = {
	ignore: [ // Do not monitor these paths for changes
		'app/', // Updates caught by gulp-watch within 'nodemon' task anyway
		'bower_components/',
		'node_modules/',
		'build/',
		'data/',
	],
	scripts: [
		'app/**/*.js',
	],
	css: [
		'public/css/**/*.css',
	],
	data: [
		'models/data/**/*.js'
	],
	scenarios: [
		'models/scenarios/**/*.json',
	],
	build: 'build',
};

requireDir('./gulp-tasks');

// Redirectors
gulp.task('default', ['nodemon']);
gulp.task('build', ['scripts', 'css']);
gulp.task('db', ['scenario']);
gulp.task('deploy', ['af-deploy']);


/**
* Compile all JS files into the build directory
*/
gulp.task('scripts', [], function() {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		.pipe(concat('all.min.js'))
		.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.build));
});


/**
* Compile all CSS files into the build directory
*/
gulp.task('css', [], function() {
	return gulp.src(paths.css)
		.pipe(sourcemaps.init())
		.pipe(concat('all.min.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.build));
});


/**
* Wipe all generated files
*/
gulp.task('clean', function(next) {
	del('./data/*', next)
});


/**
* Launch a plain server without Nodamon
*/
gulp.task('server', ['build'], function() {
	require('./server.js');
});
