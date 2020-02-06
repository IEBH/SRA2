/**
* Gulp app build tasks
*
* NOTE: Requires global.paths to be defined from gulp.conf.js
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rimraf = require('rimraf');

var common = require('./common.gulp.lib');

/**
* Builds the optimized app
* @return {Stream}
*/
gulp.task('build', function() {
	gutil.log('Building the optimized app');

	return gulp.series(
		gulp.parallel('css', 'partials', 'scripts', 'vendors'),
		'build:includes',
		'build:complete',
	);
});

/**
* Notifies completion of build task, used for serial processing of build-related tasks
*/
gulp.task('build:complete', function(finish) {
	if (app.config.gulp.notifications)
		gulp.src('').pipe(notify({
			title: app.config.title,
			onLast: true,
			message: 'Deployed code!'
		}));

	finish();
});

/**
* Copy required directories/content
*/
gulp.task('build:includes', function() {
	var dest = paths.build;
	gutil.log('Copying directories required for build');
	return gulp
		.src(paths.buildIncludes)
		.pipe(gulp.dest(dest));
});

/**
* Removes all files from the build folder
*
* One way to run clean before all tasks is to run
* from the cmd line: gulp clean && gulp build
* @return {Stream}
*/
gulp.task('build:clean', function(finish) {
	gutil.log('Cleaning: ' + gutil.colors.blue(paths.build));

	return rimraf(paths.build, finish);
});
