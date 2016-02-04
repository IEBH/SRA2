/**
* Process data/mesh-headings.bin => data/mesh-headings.json
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var readfilebyline = require('readfilebyline');

gulp.task('mesh', function(finish) {
	async()
		.set('headings', [])
		.then(function(next) {
			var self = this;
			(new readfilebyline(__dirname + '/../data/mesh-headings.bin'))
				.on('data', function(line) {
					var bits = /^MH = (.*)$/.exec(line);
					if (bits) {
						self.headings.push(bits[1]);
						if ((self.headings.length % 1000) == 0) gutil.log('Extracted', colors.cyan(self.headings.length), 'MeSH headings');
					}
				})
				.on('end', next);
		})
		.then(function(next) {
			gutil.log('Extracted', colors.cyan(this.headings.length), 'MeSH headings');
			gutil.log('Sorting');
			this.headings.sort();
			next();
		})
		.then(function(next) {
			gutil.log('Unique filtering');
			this.headings = _.unique(this.headings, true);
			next();
		})
		.then(function(next) {
			gutil.log('Final count:', colors.cyan(this.headings.length), 'MeSH headings');
			gutil.log('Writing JSON file');
			fs.writeFile(__dirname + '/../data/mesh-headings.json', JSON.stringify(this.headings, null, 2), next);
		})
		.end(finish);
});
