var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');
var gulp = require('gulp');
var gutil = require('gulp-util');

/**
* Refresh an installation on a live server
*/
gulp.task('redeploy', function(finish) {
	async()
		.use(asyncExec)
		.execDefaults({
			log: function(cmd) { gutil.log('[RUN]', cmd.cmd + ' ' + cmd.params.join(' ')) },
			out: function(line) { gutil.log('[GOT]', line) }
		})
		.exec('git pull')
		.exec('npm install')
		.exec('bower install --allow-root')
		.exec('gulp build')
		.exec('forever restartall')
		.end(finish);
});
