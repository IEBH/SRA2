/**
* Matt's little "I cant do WebPack but this will do for now" script
* This script will include frontend vendor resources from a variety of sources and splat them into ./build/vendor.min.{js,css} etc
* Vendor resources are read from paths.vendors and are relative paths from the project root
*
* @author Matt Carter <m@ttcarter.com>
* @date 2016-04-07
*/
var _ = require('lodash');
var async = require('async-chainable');
var braceExpansion = require('brace-expansion');
var cache = require('gulp-cache');
var cleanCSS = require('gulp-clean-css');
var colors = require('chalk');
var concat = require('gulp-concat');
var fs = require('fs');
var fspath = require('path');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var vendorBootCount = 0; // Tracker for how many times we've run this task internally

// Utilities {{{
/**
* Quick-and-nasty async plugin to read a JSON file and process it into JSON
* @param {string} Path the file path to read
* @param {function} The callback to fire on finish
*/
var readJSON = function(path, callback) {
	async()
		.then('contents', (next) => fs.readFile(path, 'utf-8', next))
		.then('json', function(next) {
			var json;
			try {
				json = JSON.parse(this.contents);
				next(null, json);
			} catch (e) {
				debugger;
				if (json) return next(null, json); // For some reason a throw can occur even if we have valid JSON
				next(e.toString());
			}
		})
		.end(function(err) {
			if (err) return callback(err);
			callback(null, this.json);
		});
};
// }}}

gulp.task('vendors', ['vendors-core', 'vendors-main']);

/**
* Load 'core' vendor files
* This differs from the regular vendors selection in that these should be loaded as soon as possible
* Each of these resources should stand-alone (no jQuery / Angular etc.) and should load in the very top of the page head
*/
gulp.task('vendors-core', ['load:app'], function(finish) {
	async()
		.set('includes', []) // Array of all JS / CSS files we need to include in the project
		.forEach(paths.vendors.core, function(next, dep, depIndex) { // Process all strings into paths
			// At the moment this doesn't surve a purpose but we could add extra properties here that do things like transpose individual files based on options
			this.includes[depIndex] = fspath.resolve(paths.root, dep);
			next();
		})
		.then('includes', function(next) {
			// Flatten include array (so we keep the order)
			next(null, _(this.includes)
				.map(path => braceExpansion(path))
				.flatten()
				.map(path => fspath.normalize(path))
				.value()
			);
		})
		.forEach('includes', function(next, path) {
			fs.stat(path, function(err, stats) {
				if (err) return next('Error loading dependency path "' + path + '" - ' + err.toString());
				if (stats.isDirectory()) return next('Dependency path "' + path + '" is a directory. This should be a file');
				next();
			});
		})
		.parallel({
			js: function(next) {
				var sources = this.includes.filter(i => /\.js$/.test(i));
				return gulp.src(sources)
					.pipe(concat('vendors-core.min.js'))
					.pipe(uglify())
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
			css: function(next) {
				var sources = this.includes.filter(i => /\.css$/.test(i));
				return gulp.src(sources)
					.pipe(concat('vendors-core.min.css'))
					.pipe(cleanCSS({
						processImport: false, // Prevents 'Broken @import declaration' error during build task
					}))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
		})
		.end(function(err) {
			if (err) return finish(err);
			gutil.log('Compiled', gutil.colors.cyan(this.js.length), 'core vendor JS scripts');
			gutil.log('Compiled', gutil.colors.cyan(this.css.length), 'core vendor CSS files');

			if (app.config.gulp.notifications)
				notify({
					title: app.config.title + ' - Core vendors',
					message: 'Rebuilt ' + (this.js.length + this.css.length) + ' core vendor files' + (++vendorBootCount > 1 ? ' #' + vendorBootCount : ''),
					icon: __dirname + '/icons/html5.png',
				}).write(0);

			finish();
		});
});


gulp.task('vendors-main', ['load:app'], function(finish) {
	async()
		.set('includes', []) // Array of all JS / CSS files we need to include in the project
		.forEach(paths.vendors.main, function(next, dep, depIndex) { // Process all strings into paths
			// At the moment this doesn't surve a purpose but we could add extra properties here that do things like transpose individual files based on options
			this.includes[depIndex] = fspath.resolve(paths.root, dep);
			next();
		})
		.then('includes', function(next) {
			// Flatten include array (so we keep the order)
			next(null, _(this.includes)
				.map(path => braceExpansion(path))
				.flatten()
				.map(path => fspath.normalize(path))
				.value()
			);
		})
		.forEach('includes', function(next, path) {
			fs.stat(path, function(err, stats) {
				if (err) return next('Cannot load vendor dependency - ' + path);
				if (stats.isDirectory()) return next('Dependency path "' + path + '" is a directory. This should be a file');
				next();
			});
		})
		.parallel({
			js: function(next) {
				var sources = this.includes.filter(i => /\.js$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.init()))
					.pipe(concat('vendors-main.min.js'))
					.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
					.pipe(gulpIf(app.config.gulp.minifyJS, uglify({mangle: false})))
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.write('.')))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
			css: function(next) {
				var sources = this.includes.filter(i => /\.css$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
					.pipe(concat('vendors-main.min.css'))
					.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS()))
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
		})
		.end(function(err) {
			if (err) {
				gutil.log(colors.red('ERROR'), err.toString());
			} else {
				gutil.log('Compiled', gutil.colors.cyan(this.js.length), 'main vendor JS scripts');
				gutil.log('Compiled', gutil.colors.cyan(this.css.length), 'main vendor CSS files');

				if (app.config.gulp.notifications)
					notify({
						title: app.config.title + ' - Main vendors',
						message: 'Rebuilt ' + (this.js.length + this.css.length) + ' vendor files' + (++vendorBootCount > 1 ? ' #' + vendorBootCount : ''),
						icon: __dirname + '/icons/html5.png',
					}).write(0);
			}

			finish();
		});
});
