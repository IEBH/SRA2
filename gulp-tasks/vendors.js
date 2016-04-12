/**
* Matt's little "I Cant do WebPack but this will do for now" script
* This script will include frontend vendor resources from a variety of sources and splat them into ./build/vendor.min.{js,css} etc
* Vendor resources are read from paths.vendors and can be composed of the following formats:
* | Prefix         | Description                                                                                                |
* |----------------|------------------------------------------------------------------------------------------------------------|
* | bower://pkg    | Read in the resources of a Bower package (requires the `bower.json`/.main relationship to be correctly set |
* | file://pkg     | Raw file address (relative to root directory of site)                                                      |
* | npm://pkg      | Regular NPM package (requires `package.json`/.main relationship to be correctly set)                       |
*
* @author Matt Carter <m@ttcarter.com>
* @date 2016-04-07
*/
var _ = require('lodash');
var async = require('async-chainable');
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var fs = require('fs');
var fspath = require('path');
var minifyCSS = require('gulp-minify-css');
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

gulp.task('vendors', ['load:config'], function(finish) {
	async()
		.set('includes', []) // Array of all JS / CSS files we need to include in the project
		.forEach(paths.vendors, function(next, dep, depIndex) {
			var self = this;
			var depBits = /^(.+?):\/\/(.+)$/.exec(dep);
			if (!depBits) return next('Unknown frontend depdency format: ' + dep + '. Format needs to be in SOMETHING://PATH format.');
			var depProtocol = depBits[1];
			var depPath = depBits[2];

			if (depProtocol == 'bower') {
				var base = config.root + '/bower_components/' + depPath;
				readJSON(base + '/bower.json', function(err, pkg) {
					if (err) return next(err);
					if (!pkg.main) return next('Cannot include Bower dependency "' + depPath + '" as there is no "main" key within its bower.json schema');
					gutil.log(gutil.colors.blue('[Vendors]'), 'Bower dependency', gutil.colors.cyan(depPath));
					self.includes[depIndex] = _.castArray(pkg.main).map(f => base + '/' + f);
					next();
				});
			} else if (depProtocol == 'file') {
				gutil.log(gutil.colors.blue('[Vendors]'), 'File dependency', gutil.colors.cyan(depPath));
				self.includes[depIndex] = config.root + '/' + depPath;
				next();
			} else if (depProtocol == 'npm') {
				var base = config.root + '/node_modules/' + depPath;
				readJSON(base + '/package.json', function(err, pkg) {
					if (err) return next(err);
					if (!pkg.main) return next('Cannot include NPM dependency "' + depPath + '" as there is no "main" key within its package.json schema');
					gutil.log(gutil.colors.blue('[Vendors]'), 'NPM dependency', gutil.colors.cyan(depPath));
					self.includes[depIndex] = base + '/' + pkg.main;
					next();
				});
			} else {
				next('Unknown vendor protocol: ' + depProtocol + ' for depedency ' + dep);
			}
		})
		.then('includes', function(next) {
			// Flatten include array (so we keep the order)
			next(null, _(this.includes)
				.flatten()
				.map(path => fspath.normalize(path))
				.value()
			);
		})
		.forEach('includes', function(next, path) {
			fs.stat(path, function(err, stats) {
				if (err) return next('Error loading depdency path "' + path + '". Maybe you should specify the file directly with file://PATH - ' + err.toString());
				if (stats.isDirectory()) return next('Depdendency path "' + path + '" is a directory. This should be a file');
				next();
			});
		})
		.parallel({
			js: function(next) {
				var sources = this.includes.filter(i => /\.js$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(config.gulp.debugJS, sourcemaps.init()))
					.pipe(concat('vendor.min.js'))
					.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
					.pipe(gulpIf(config.gulp.minifyJS, uglify({mangle: false})))
					.pipe(gulpIf(config.gulp.debugJS, sourcemaps.write()))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
			css: function(next) {
				var sources = this.includes.filter(i => /\.css$/.test(i));
				return gulp.src(sources)
					.pipe(gulpIf(config.gulp.debugCSS, sourcemaps.init()))
					.pipe(concat('vendor.min.css'))
					.pipe(gulpIf(config.gulp.minifyCSS, minifyCSS()))
					.pipe(gulpIf(config.gulp.debugCSS, sourcemaps.write()))
					.pipe(gulp.dest(paths.build))
					.on('end', () => next(null, sources));
			},
		})
		.end(function(err) {
			if (err) return finish(err);
			gutil.log('Compiled', gutil.colors.cyan(this.js.length), 'vendor JS scripts');
			gutil.log('Compiled', gutil.colors.cyan(this.css.length), 'vendor CSS files');

			notify({
				title: config.title + ' - Vendors',
				message: 'Rebuilt ' + (this.js.length + this.css.length) + ' vendor files' + (++vendorBootCount > 1 ? ' #' + vendorBootCount : ''),
				icon: __dirname + '/icons/ng.png',
			}).write(0);

			finish();
		});
});
