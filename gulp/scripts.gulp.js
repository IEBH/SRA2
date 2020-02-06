/**
* Aggregate vendor and app CSS
*/

var _ = require('lodash');
var bytediff = require('gulp-bytediff');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var colors = require('chalk');
var fs = require('fs');
var gplumber = require('gulp-plumber');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var common = require('./common.gulp.lib');

/**
* Compile all JS files into the build directory
*/
var scriptBootCount = 0;
gulp.task('scripts', ['load:app'], function() {
	var hasErr;
	return gulp.src(`${__dirname}/../app/**/*.js`)
		.pipe(gplumber({
			errorHandler: function(err) {
				gutil.log(colors.red('ERROR DURING JS BUILD'));
				notify({message: err.name + '\n' + err.message, title: app.config.title + ' - JS Error'}).write(err);
				process.stdout.write(err.stack);
				hasErr = err;
				this.emit('end');
			},
		}))
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: ['angularjs-annotate'],
		}), {
			key: function(file) {
				return [file.contents.toString('utf8'), file.stat.mtime, file.stat.size].join('');
			},
			success: function(file) {
				gutil.log(gutil.colors.blue('[Babel]'), 'compile', colors.cyan(file.relative));
				return true;
			},
		})
		.pipe(replace(/^'use strict';\n$/m, ''))
		.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.init()))
		.pipe(concat('app.min.js'))
		.pipe(bytediff.start())
		.pipe(replace("\"app\/", "\"\/app\/")) // Rewrite all literal paths to relative ones
		.pipe(replace(new RegExp('0\\s*\\/' + '\\*IMPORT: (.+)\\*\\/', 'g'), (junk, i) => JSON.stringify(_.get(global, i)))) // Import variables in units/theme/config.serv.js
		.pipe(gulpIf(app.config.gulp.minifyJS, uglify({mangle: false})))
		.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.write('.')))
		.pipe(bytediff.stop(common.bytediffFormatter))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			if (!hasErr && app.config.gulp.notifications)
				notify({
					title: app.config.title + ' - Scripts',
					message: 'Rebuilt frontend scripts' + (++scriptBootCount > 1 ? ' #' + scriptBootCount : ''),
					icon: __dirname + '/icons/javascript.png',
				}).write(0);
		});
});
