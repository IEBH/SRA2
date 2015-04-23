var gulp = require('gulp');
var gutil = require('gulp-util');

/**
* Dump the current config files to the console
*/
gulp.task('config', function() {
	var config = require('./config');
	gutil.log(config);
});


/**
* Connect to the local DB (using the current config) and output all user rows
*/
gulp.task('dbtest', function(next) {
	global.config = require('./config');
	gutil.log('Opening DB connection...');
	require('./config/db');
	gutil.log('Testing User query...');
	var users = require('./models/users');
	users.find({}, function(err, data) {
		if (err) {
			gutil('Got error', err.red);
		} else {
			gutil.log('Got data', data);
		}
		next(err);
	});
});
