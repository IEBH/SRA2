var gulp = require('gulp');
var gutil = require('gulp-util');
var scenario = require('gulp-mongoose-scenario');

/**
* Setup the local Mongo DB with all the files located in paths.data
*/
gulp.task('scenario', [], function(finish) {
	global.config = require('../config');
	require('../config/db');
	require('../models');

	gulp.src(paths.scenarios)
		.pipe(scenario({connection: db, nuke: true}))
		.on('error', function(err) {
			gutil.log('Error loading scenario'.red, err);
		})
		.on('end', finish);
});
