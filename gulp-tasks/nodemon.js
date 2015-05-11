var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('nodemon', ['load:config', 'build'], function(finish) {
	watch(paths.scripts, function() {
		gutil.log('Rebuild client-side JS files...');
		gulp.start('scripts');
	});

	watch(paths.css, function() {
		gutil.log('Rebuild client-side CSS files...');
		gulp.start('css');
	});

	var runCount = 0;
	nodemon({
		script: 'server.js',
		ext: 'html js ejs css scss',
		ignore: paths.ignore.concat(paths.scripts, paths.css), // Only watch server files - everything else is handled seperately anyway
	})
		.on('start', function() {
			if (runCount > 0) return;
			notify({message: 'Server started', title: config.title}).write();
		})
		.on('restart', function() {
			notify({message: 'Server restart #' + ++runCount, title: config.title}).write();
		});
});
