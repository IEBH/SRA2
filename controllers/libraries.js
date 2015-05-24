var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');
var moment = require('moment');
var Libraries = require('../models/libraries');
var ProcessQueue = require('../models/processQueue');
var References = require('../models/references');
var rl = require('reflib');

/**
* Accept a file and upload it either into a new or existing library
* @param array req.files Array of files to process
* @param string req.body.libraryId The library ID to upload into, if omitted a new one is created (using req.body.library)
* @param object req.body.library Library prototype object to create (e.g. 'title')
* @param object req.body.libraryTitle Alternate method to populate library.title within a POST operation
*/
app.post('/api/libraries/import', function(req, res) {
	async()
		.set('count', 0)
		.then(function(next) {
			// Sanity checks {{{
			if (!req.files) return next('No files were uploaded');
			if (!req.user) return next('You are not logged in');
			if (req.body.libraryId && !_.isString(req.body.libraryId)) return next('libraryId must be a string');
			if (req.body.library && !_.isObject(req.body.library)) return next('library must be an object');
			next();
			// }}}
		})
		.forEach(req.files, function(next, file) {
			// File sanity checks {{{
			if (file.originalname && !rl.identify(file.originalname)) return next('File type not supported');
			next();
			// }}}
		})
		.then('library', function(next) {
			if (req.body.libraryId && req.body.libraryId != 'new') { // Existing
				Libraries.findOne({_id: req.body.libraryId}, next);
			} else if (req.body.library) { // Create a new one with prototype
				var library = _.clone(req.body.libray);
				library.owners = [ req.user._id ];
				Libraries.create(req.body.library, next);
			} else if (req.body.libraryTitle) { // Create one with just a name
				Libraries.create({
					title: req.body.libraryTitle,
					owners: [ req.user._id ],
				}, next);
			} else { // Create a new one from scratch
				Libraries.create({
					title: moment().format("MMM Do YYYY, h:mma"),
					owners: [ req.user._id ],
				}, next);
			}
		})
		.forEach(req.files, function(next, file) {
			var self = this;
			console.log('Upload', file.path);
			rl.parse(rl.identify(file.originalname) || 'endnotexml', fs.readFileSync(file.path))
				.on('error', function(err) {
					next(err);
				})
				.on('ref', function(ref) {
					ref.library = self.library._id;
					References.create(ref);
				})
				.on('end', function(count) {
					self.count += count;
					next();
				});
		})
		.end(function(err) {
			if (err) return res.status(400).send(err).end();
			res.redirect('/#/libraries/' + this.library._id);
		});
});


/**
* Export a library into the provided container format
* @param string req.params.id The library ID to export
* @param string req.params.format The library output format (must be supported by Reflib)
*/
app.get('/api/libraries/:id/export/:format', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.user) return next('You are not logged in');
			if (!req.params.id) return next('id must be specified');
			if (!req.params.format) return next('format must be specified');
			next();
			// }}}
		})
		.then('format', function(next) {
			var format = _.find(rl.supported, {id: req.params.format});
			if (!format) return next('format is unsupported: ' + req.params.format);
			res.attachment(format.filename);
			next(null, format);
		})
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		.then(function(next) {
			rl.output({
				format: req.params.format,
				stream: res,
				content: function(next, batch) {
					console.log('Fetch batch', batch);
					References.find({library: this.library._id, status: 'active'})
						.limit(config.limits.references)
						.skip(config.limits.references * batch)
						.exec(next);
				},
			})
				.on('finish', function() {
					next();
				})
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.end();
		});
});


/**
* Get a list of all supproted library formats
* This really just returns the reflib.supported structure
*/
app.get('/api/libraries/formats', function(req, res) {
	res.send(rl.supported.map(function(format) {
		return {
			id: format.id,
			name: format.name,
			ext: format.ext,
		};
	}));
});


/**
* Mark all references within a library as deleted
* @param req.param.id The library ID to clear
*/
app.get('/api/libraries/:id/clear', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.params.id) return next('id must be specified');
			next();
			// }}}
		})
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		.then(function(next) {
			References.update({library: this.library._id}, {status: 'deleted'}, {multi: true}, next);
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({id: this.library._id});
		});
});


/**
* Create a processQueue item for each reference in the reference table
* @param string req.params.id The library ID to operate on
* @param string req.params.operation The operation to perform
* @param object req.body Additional options to pass to the records (stored in processQueue.settings)
*/
app.all('/api/libraries/:id/process/:operation', function(req, res) {
	async()
		.set('settings', req.body.settings || {})
		// Sanity checks {{{
		.then(function(next) {
			if (!req.user) return next('You are not logged in');
			if (!req.params.id) return next('id must be specified');
			if (!req.params.operation) return next('operation must be specified');
			next();
		})
		// }}}
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		.then('references', function(next) {
			References
				.find({library: this.library._id, status: 'active'})
				.select('_id')
				.exec(next);
		})
		.then(function(next) {
			ProcessQueue.create({
				creator: req.user,
				operation: req.params.operation,
				owner: req.user._id,
				library: this.library._id,
				references: this.references.map(function(ref) { return ref._id }),
				history: [{type: 'queued'}],
				settings: this.settings,
			}, next);
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({_id: this.library._id});
		});
});


/**
* Get the status of an operation
* @param string req.params.id The operation ID to query
*/
app.get('/api/operation/:id', function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.user) return next('You are not logged in');
			if (!req.params.id) return next('id must be specified');
			next();
		})
		// }}}
		.then('operation', function(next) {
			processQueue.findOne({id: req.params.id});
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send(_.pick(this.operation, [
				'_id', 'created', 'library', 'status', 'progress', 'history'
			]));
		});
});


restify.serve(app, Libraries, {
	middleware: function(req, res, next) {
		if (!req.user) return res.status(400).send('You must be logged in to do that');

		// Ensure that .owners is either specified OR glue it to the query if not {{{
		if (req.user.role == 'user' && req.body.owners) {
			var owners = req.body.owners || req.query.owners;
			if (_.isArray(owners)) {
				if (!_.contains(owners, req.user._id)) return res.status(400).send('Owners must contain the current user id');
			} else if (_.isString(owners)) {
				if (owners != req.user._id) return res.status(400).send('Owners must be the current user id');
			} else {
				req.query.owners = req.user._id;
			}
		}
		// }}}
		next();
	},
});
