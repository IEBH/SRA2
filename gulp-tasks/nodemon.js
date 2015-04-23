var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var nodemon = require('gulp-nodemon');

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('nodemon', ['build'], function () {
	watch(paths.scripts, function() {
		gutil.log('Rebuild client-side JS files...');
		gulp.start('scripts');
	});

	watch(paths.css, function() {
		gutil.log('Rebuild client-side CSS files...');
		gulp.start('css');
	});

	nodemon({
		script: 'server.js',
		ext: 'html js ejs css scss',
		ignore: paths.ignore,
		tasks: function(files) {
			// Detect Angular script changes {{{
			if (files.some(function(f) {
				return /\.js$/.test(f) && /^app\//.test(f);
			})) tasks.push('scripts');
			// }}}
			// Detect CSS changes {{{
			if (files.some(function(f) {
				return /\.css$/.test(f);
			})) tasks.push('css');
			// }}}
			console.log('Restarted with tasks', tasks);
		},
	});
});
