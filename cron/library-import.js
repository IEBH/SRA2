/**
* Library-import
* Read a temporary file name containing references into a new or existing library
* @params {string} [task.settings.library] Optional existing library to import into
* @params {string} [task.settings.libraryTitle] Optional title of the library if `task.settings.library` is omitted. If omitted the date is used
* @params {array} [task.settings.blobIDs] Array of blob IDs to import (usually corresponds with a file `/tmp/blob-${ID}`
*/
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var Libraries = require('../models/libraries');
var moment = require('moment');
var os = require('os');
var References = require('../models/references');
var reflib = require('reflib');

module.exports = function(finish, task) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!task.settings.blobIDs) return next('BlobIDs must be specified');
			if (!_.isArray(task.settings.blobIDs)) return next('BlobIDs must be an array');
			next();
		})
		// }}}
		// Retrieve data {{{
		.then('library', function(next) {
			if (task.settings.library) { // Import into existing
				Libraries.findOne({_id: task.library}, function(err, lib) {
					if (err) return next(err);
					if (!lib) return next('Library not found');
					next(null, lib);
				});
			} else {
				Libraries.create({
					title: task.settings.libraryTitle || moment().format("MMM Do YYYY, h:mma"),
				}, next);
			}
		})
		// }}}

		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = 0;
			task.history.push({type: 'status', response: 'Preparing to import blobs ' + task.settings.blobIDs.join(', ')});
			task.save(next);
		})
		// }}}

		// Worker / Setup {{{
		.set('tags', {}) // Lookup array for tags
		.set('refs', []) // References to create
		// }}}
		// Worker / Parse files {{{
		.forEach(task.settings.blobIDs, function(next, blobID) {
			var task = this;
			var library = this.library;
			var blobFile = os.tmpDir() + '/blob-' + blobID;
			reflib.parseFile(blobFile, {
				fixes: {
					authors: true,
					dates: true,
					pages: true,
				},
			})
				.on('end', next)
				.on('error', next)
				.on('ref', function(ref) {
					ref.library = library._id;
					if (ref.tags) ref.tags.forEach(tag => task.tags[tag] = true);
					task.refs.push(_.omit(ref, ['_id', 'created', 'edited', 'status']));
				});
		})
		// }}}
		// Create Tags {{{
		.forEach('tags', function(nextTag, junk, tag) {
			var self = this;
			ReferenceTags.create({
				title: tag,
				library: this.library._id,
			}, function(err, createdTag) {
				if (err) return nextTag(err);
				self.tags[tag] = createdTag;
				nextTag();
			});
		})
		// }}}
		// Create References {{{
		.forEach('refs', function(nextRef, ref) {
			var task = this;
			if (ref.tags) ref.tags = ref.tags.map(tag => task.tags[tag]._id)
			References.create(ref, nextRef);
		})
		// }}}
		// Finish {{{
		.then(function(next) { // Finalize task data
			task.destination = config.url + '/#/libraries/' + this.library._id;
			task.history.push({type: 'completed', response: 'Completed import. Imported ' + this.refs.length + ' references with ' + _.size(this.tags) + ' tags'});
			console.log(colors.blue('Upload'), colors.green('Completed'), 'Imported', colors.cyan(this.refs.length), 'references with', colors.cyan(_.size(this.tags)), 'tags');
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
