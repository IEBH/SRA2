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
			style: 'passthru',
			log: function(cmd) { gutil.log('[RUN]', cmd.cmd + ' ' + cmd.params.join(' ')) },
		})
		.exec('git pull')
		.exec('npm install')
		.exec('bower install --allow-root')
		.exec('gulp build')
		.exec('forever restartall')
		.end(finish);
});
