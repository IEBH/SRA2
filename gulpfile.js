var _ = require('lodash');
var annotate = require('gulp-ng-annotate');
var babel = require("gulp-babel");
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var requireDir = require('require-dir');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

// Configure / Plugins {{{
requireDir('./gulp-tasks');
notify.logLevel(0);
// }}}

// Configure / Paths {{{
global.paths = {
	ignore: [ // Do not monitor these paths for changes
		'app/', // No need to watch this with nodemon as its handled seperately
		'views/partials',
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
// }}}

// Redirectors {{{
gulp.task('default', ['nodemon']);
gulp.task('build', ['scripts', 'css']);
gulp.task('db', ['scenario'], process.exit);
gulp.task('deploy', ['af-deploy']);
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

// Custom tasks for this project {{{
/**
* Compile all JS files into the build directory
*/
gulp.task('scripts', ['load:config'], function() {
	return gulp.src(paths.scripts)
		.pipe(babel())
		.pipe(gulpIf(config.gulp.debugJS, sourcemaps.init()))
		.pipe(concat('site.min.js'))
		.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
		.pipe(gulpIf(config.gulp.minifyJS, annotate()))
		.pipe(gulpIf(config.gulp.minifyJS, uglify({mangle: false})))
		.pipe(gulpIf(config.gulp.debugJS, sourcemaps.write()))
		.pipe(gulp.dest(paths.build))
		.pipe(notify({message: 'Rebuilt frontend scripts', title: config.title}));
});


/**
* Compile all CSS files into the build directory
*/
gulp.task('css', ['load:config'], function() {
	return gulp.src(paths.css)
		.pipe(gulpIf(config.gulp.debugCSS, sourcemaps.init()))
		.pipe(concat('site.min.css'))
		.pipe(gulpIf(config.gulp.minifyCSS, minifyCSS()))
		.pipe(gulpIf(config.gulp.debugCSS, sourcemaps.write()))
		.pipe(gulp.dest(paths.build))
		.pipe(notify({message: 'Rebuilt frontend CSS', title: config.title}));
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
// }}}
