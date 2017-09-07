/**
* Aggregate vendor and app CSS
*
* NOTE: Requires global.paths to be defined from gulp.conf.js
*/

var bytediff = require('gulp-bytediff');
var cleanCSS = require('gulp-clean-css');
var colors = require('chalk');
var concat = require('gulp-concat');
var gplumber = require('gulp-plumber');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');

var common = require('./common.gulp.lib');

/**
* Compile all CSS files into the build directory
* @return {Stream}
*/
var cssBootCount = 0;
gulp.task('css', ['load:app'], function() {
	var hasErr = false;
	return gulp.src(paths.css.concat([`${__dirname}/../public/css/**/*.css`]))
		.pipe(gplumber({
			errorHandler: function(err) {
				gutil.log(colors.red('ERROR DURING CSS BUILD'));
				notify({message: err.name + '\n' + err.message, title: app.config.title + ' - CSS Error'}).write(err);
				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
		.pipe(concat('app.min.css'))
		.pipe(bytediff.start())
		.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
			processImport: false, // Prevents 'Broken @import declaration' error during build task
		})))
		.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write()))
		.pipe(bytediff.stop(common.bytediffFormatter))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			if (!hasErr && app.config.gulp.notifications)
				notify({
					title: app.config.title + ' - CSS',
					message: 'Rebuilt frontend CSS' + (++cssBootCount > 1 ? ' #' + cssBootCount : ''),
					icon: __dirname + '/icons/css.png',
				}).write(0);
		});
});
