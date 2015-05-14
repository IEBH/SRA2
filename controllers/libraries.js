var _ = require('lodash');
var async = require('async-chainable');
var moment = require('moment');
var Libraries = require('../models/libraries');
var References = require('../models/references');
var rl = require('reflib');

/**
* Accept a file and upload it either into a new or existing library
* @param array req.files Array of files to process
* @param string req.body.libraryId The library ID to upload into, if omitted a new one is created (using req.body.library)
* @param object req.body.library Library prototype object to create (e.g. 'title')
*/
app.post('/api/libraries/import', function(req, res) {
	async()
		.set('count', 0)
		.then(function(next) {
			console.log('GOT FILES', req.files);
			return next('FAKE ERROR');
			// Sanity checks {{{
			if (!req.files) return next('No files were uploaded');
			if (!req.user) return next('You are not logged in');
			if (req.body.libraryId && !_.isString(req.body.libraryId)) return next('libraryId must be a string');
			if (req.body.library && !_.isObject(req.body.library)) return next('library must be an object');
			next();
			// }}}
		})
		.then('library', function(next) {
			if (req.body.libraryId) { // Existing
				Libraries.findOne({_id: req.body.libraryId}, next);
			} else if (req.body.library) { // Create a new one with prototype
				var library = _.clone(req.body.libray);
				library.owners = [ req.user._id ];
				Libraries.create(req.body.library, next);
			} else { // Create a new one from scratch
				Libraries.create({
					title: moment().format("MMM Do YYYY, h:mm:ss a"),
					owners: [ req.user._id ],
				}, next);
			}
		})
		.forEach(req.files, function(next, file) {
			var self = this;
			rl.parse(fs.readFileSync(file.path))
				.on('error', function(err) {
					return next(err);
				})
				.on('ref', function(ref) {
					ref.library = self.library._id;
					References.create(ref);
				})
				.on('end', function(count) {
					self.count += count;
					return next();
				});
		})
		.end(function(err) {
			if (err) return res.status(400).send(err).end();
			res.status(200).send({id: this.library._id});
		});
});

restify.serve(app, Libraries);
