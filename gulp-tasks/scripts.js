var annotate = require('gulp-ng-annotate');
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var colors = require('chalk');
var gplumber = require('gulp-plumber');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

/**
* Compile all JS files into the build directory
*/
var scriptBootCount = 0;
gulp.task('scripts', ['load:config'], function() {
	var hasErr;
	return gulp.src(paths.scripts)
		.pipe(gplumber({
			errorHandler: function(err) {
				gutil.log(colors.red('ERROR DURING JS BUILD'));
				notify({message: err.name + '\n' + err.message, title: config.title + ' - JS Error'}).write(err);
				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(cache(babel({ // Cache output and pipe though Babel
			presets: ['es2015'],
		}), {
			key: function(file) {
				return [file.contents.toString('utf8'), file.stat.mtime, file.stat.size].join('');
			},
			success: function(file) {
				gutil.log('Babel compile', colors.cyan(file.relative));
				return true;
			},
		}))
		.pipe(gulpIf(config.gulp.debugJS, sourcemaps.init()))
		.pipe(concat('site.min.js'))
		.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
		.pipe(gulpIf(config.gulp.minifyJS, annotate()))
		.pipe(gulpIf(config.gulp.minifyJS, uglify({mangle: false})))
		.pipe(gulpIf(config.gulp.debugJS, sourcemaps.write()))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			if (!hasErr)
				notify({
					title: config.title,
					message: 'Rebuilt frontend scripts' + (++scriptBootCount > 1 ? ' #' + scriptBootCount : ''),
					icon: __dirname + '/icons/angular.png',
				}).write(0);
		});
});


gulp.task('scripts:clean', function(next) {
	cache.clearAll(next);
});
