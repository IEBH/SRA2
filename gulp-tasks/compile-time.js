var babel = require('babel-core');
var colors = require('chalk');
var gulp = require('gulp');
var mapStream = require('map-stream');

gulp.task('compile-time', function(finish) {
	var files = [];

	gulp.src(paths.scripts)
		.pipe(mapStream(function(file, next) {
			var startTime = Date.now();
			var transformed = babel.transform(file.contents.toString());
			files.push({
				path: file.relative,
				time: Date.now() - startTime,
			});
			next();
		}))
		.on('end', function() {
			files.sort(function(a, b) {
				if (a.time == b.time) return 0;
				if (a.time < b.time) return -1;
				return 1;
			});

			var totalTime = 0;
			files.forEach(function(file) {
				console.log('Compiled', colors.blue(file.path), 'in', colors.cyan(file.time + 'ms'));
				totalTime += file.time;
			});
			console.log('Total compile time', colors.cyan(totalTime + 'ms'));
			finish();
		});
});
