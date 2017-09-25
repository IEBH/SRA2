/**
* Provides tasks that output debugging information or perform debugging tests
*/

var gulp = require('gulp');
var gutil = require('gulp-util');


/**
* Dump the full app structure to the console
* This is similar to `gulp config` but dumps the stub `app` structure also
*/
gulp.task('app', ['load:app'], function() {
	gutil.log(app);
});


/**
* Dump the current app.config subtree to the console
*/
gulp.task('app.config', ['load:app'], function() {
	gutil.log(app.config);
});


/**
* Connect to the local DB (using the current config) and output all user rows
*/
gulp.task('db:test', ['load:app.db'], function(next) {
	gutil.log('Testing User query...');
	app.db.users.find({}, function(err, data) {
		if (err) {
			gutil('Got error', err.red);
		} else {
			gutil.log('Got data', data);
		}
		next(err);
	});
});
