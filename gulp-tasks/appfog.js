var _ = require('lodash');
var async = require('async-chainable');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var spawn = require('child_process').spawn;

/**
* Deploys a site to AppFog
* This task creates the silly .afignore and npm-shrinkwrap.json files that `af` requires for the process then cleans up when done
* @author Matt Carter <m@ttcarter.com>
* @date 2015-01-13
*/
gulp.task('af-deploy', function(done) {
	global.config = require('../config');
	if (!config.deploy || !config.deploy.appfog || !config.deploy.appfog.profile) return next('Config values missing for config.deploy.appfog.profile');

	async()
		.parallel([
			function(next) {
				async()
					.then(function(next) {
						gutil.log('Shrink wrapping packages...');
						// Run npm shrinkwrap
						spawn('npm', ['shrinkwrap'])
							.on('close', function(code) {
								if (code != 0) return next('NPM shrinkwrap returned code:' + code);
								next();
							});
					})
					.then(function(next) { // `af` gets upset if there is a .from key in the shrinkwrap file
						gutil.log('Fixing shrinkwrap file...');
						var shrink = JSON.parse(fs.readFileSync('npm-shrinkwrap.json').toString());
						var walker = function(obj) {
							if (obj.from) delete obj.from;
							_.forEach(obj, function(v, k) {
								obj[k] = (_.isObject(v)) ? walker(v) : v; // Recurse down
							})
							return obj;
						};
						shrink = walker(shrink);
						fs.writeFile('npm-shrinkwrap.json', JSON.stringify(shrink, null, 2), next);
					})
					.end(next);
			},

			function(next) { // We have to label some files as ignored by AF
				fs.writeFile('.afignore', 'node_modules/', next);
			}
		])
		.then(function(next) {
			var args = ['update', config.deploy.appfog.profile];
			if (config.deploy.appfog.team)
				args.unshift('-u', config.deploy.appfog.team);

			gutil.log('Running `af ' + args.join(' ') + '`...');
			spawn('af', args, {
				cwd: __dirname, // Must be root of project or `af` uploads the wrong thing
				stdio: 'inherit',
			})
			.on('close', function(code) {
				if (code != 0) return next('AppFog process (`af`) exited with code ' + code + '. This is usually caused by not having AppFog installed or not having logged in');
				next();
			});
		})
		.then(function(next) {
			gutil.log('Cleaning up...');
			del('npm-shrinkwrap.json');
			del('.afignore');
			next();
		})
		.end(done);
});
