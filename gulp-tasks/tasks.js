var gulp = require('gulp');
var rimraf = require('rimraf');

gulp.task('clean', function(next) {
	rimraf('./data/*', next)
});


gulp.task('clean-tasks', ['load:db'], function(next) {
	var Tasks = require('./models/tasks');
	Tasks.remove(function() { next() });
});
