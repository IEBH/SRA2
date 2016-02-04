var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var scenario = require('gulp-mongoose-scenario');

/**
* Setup the local Mongo DB with all the files located in paths.data
*/
gulp.task('scenario', ['load:models'], function(finish) {
	if (config.env == 'production') return finish('Refusing to reload database in production! If you REALLY want to do this use `NODE_ENV=something gulp db`');
	gulp.src(paths.scenarios)
		.pipe(scenario({connection: db, nuke: true}))
		.on('error', function(err) {
			gutil.log('Error loading scenario'.red, err);
		})
		.on('end', function(err) {
			notify({
				title: config.title,
				message: 'Build database',
				icon: __dirname + '/icons/mongodb.png',
			}).write(0);
			finish(err);
		});
});
