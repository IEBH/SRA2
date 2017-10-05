/**
* Tasks to populate db with specific scenario data - either default or test scenarios
*/

var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var mongoose = require('mongoose');
var scenario = require('gulp-mongoose-scenario');

/**
* Setup the local Mongo DB with all the files located in ./*.json
*/
gulp.task('scenario', ['load:app.db'], function(finish) {
	if (config.env == 'production') return finish('Refusing to reload database in production! If you REALLY want to do this use `NODE_ENV=something gulp db`');
	gulp.src(`${app.config.paths.root}/units/**/*.scenario.json`)
		.pipe(scenario({
			connection: app.db,
			nuke: true,
			getModels: ()=> _.keys(app.db).filter(k => k != 'index'),
			getCollection: id => mongoose.model(id),
			getCollectionSchema: id => mongoose.model(id).schema,
		}))
		.on('error', function(err) {
			gutil.log(gutil.colors.red('Error loading scenario'), err);
		})
		.on('end', function(err) {
			notify({
				title: config.title + ' - Scenario',
				message: 'Build database',
				icon: __dirname + '/icons/mongodb.png',
			}).write(0);
			finish(err);
		});
});
