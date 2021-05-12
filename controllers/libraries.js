var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var copy = require('fs-copy-simple');
var email = require('../lib/email');
var fs = require('fs');
var fspath = require('path');
var Libraries = require('../models/libraries');
var multer = require('multer');
var moment = require('moment');
var os = require('os');
var References = require('../models/references');
var ReferenceTags = require('../models/referenceTags');
var reflib = require('reflib');
var strtotime = require('strtotime');
var Tasks = require('../models/tasks');
var temp = require('temp');

/**
* Accept a file and upload it either into a new or existing library
* @depreciated 2016-06-07 Replaced with /import process below - this used to try to do the processing during upload rather than splitting into a task first
* @param array req.files Array of files to process
* @param string req.body.libraryId The library ID to upload into, if omitted a new one is created (using req.body.library)
* @param object req.body.library Library prototype object to create (e.g. 'title')
* @param object req.body.libraryTitle Alternate method to populate library.title within a POST operation
* @param string req.body.json If set the created (or modified) library record is returned instead of redirecting to the library page
*/
app.post('/api/libraries/importDirect', multer().any(), function(req, res) {
	async()
		.set('count', 0)
		// Sanity checks {{{
		.then(function(next) {
			if (!req.files) return next('No files were uploaded');
			if (!req.user) return next('You are not logged in');
			if (req.body.libraryId && !_.isString(req.body.libraryId)) return next('libraryId must be a string');
			if (req.body.library && !_.isObject(req.body.library)) return next('library must be an object');
			next();
		})
		// }}}
		// Per-File sanity checks {{{
		.forEach(req.files, function(next, file) {
			var rlDriver = reflib.identify(file.originalname);
			console.log(colors.blue('Upload'), colors.cyan(file.originalname), 'using driver', colors.cyan(rlDriver));
			if (file.originalname && !rlDriver) return next('File type not supported');
			next();
		})
		// }}}
		// Create / get existing library {{{
		.then('library', function(next) {
			// Import into existing
			if (req.body.libraryId && req.body.libraryId != 'new') return Libraries.findOne({_id: req.body.libraryId}, next);

			var proto = {
				title: req.body.libraryTitle || moment().format("MMM Do YYYY, h:mma"),
				owners: [ req.user._id ],
				expires: req.body.libraryExpires || undefined,
			};

			if (req.body.library) { // Create a new one with prototype
				proto = _.omit(_.clone(req.body.library), ['_id', 'owners', 'status']);
				proto.owners = [ req.user._id ];
			}

			if (proto.expires) proto.expires = strtotime(proto.expires);

			Libraries.create(proto, next);
		})
		// }}}
		// For each file - import references {{{
		.set('refs', []) // References to create
		.set('tags', {}) // Lookup array for tags
		.forEach(req.files, function(next, file) {
			var self = this;
			reflib.parse(reflib.identify(file.originalname) || 'endnotexml', file.buffer.toString(), {
				fixes: {
					authors: true,
					dates: true,
					pages: true,
				},
			})
				.on('error', function(err) {
					next(err);
				})
				.on('ref', function(ref) {
					ref.library = self.library._id;
					if (ref.tags) ref.tags.forEach(function(tag) { self.tags[tag] = true });
					self.refs.push(_.omit(ref, ['_id', 'created', 'edited', 'status']));
					self.count++;
					if ((self.count % 500) == 0) console.log(colors.blue('Upload'), 'Imported', colors.cyan(self.count), 'refs from', colors.cyan(file.originalname));
				})
				.on('end', function() {
					next();
				});
		})
		// }}}
		.limit(50)
		// Create tags {{{
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
		// Create references {{{
		.forEach('refs', function(nextRef, ref) {
			var self = this;
			if (ref.tags) ref.tags = ref.tags.map(function(tag) { return self.tags[tag]._id })
			References.create(ref, nextRef);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) {
				console.log(colors.blue('Upload'), colors.red('ERROR'), err.toString());
				return res.status(400).send(err.toString()).end();
			}

			console.log(colors.blue('Upload complete'), 'imported', colors.cyan(this.count), 'items');
			if (req.body.json) return res.send(this.library);
			res.send({error: false, url: '/#/libraries/' + this.library._id});
		});
		// }}}
});


/**
* Accept a file and schedule an import task to process it a new or existing library
* @param {array} req.files Array of files to process
* @param {string} [req.body.library] The library ID to upload into, if omitted a new one is created (using req.body.library)
* @param {string} [req.body.libraryTitle] Alternate method to populate library.title within a POST operation
*/
app.post('/api/libraries/import', multer().any(), function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.files) return next('No files were uploaded');
			if (!req.user) return next('You are not logged in');
			if (req.body.library && !_.isString(req.body.library)) return next('library must be a string');
			if (req.body.libraryTitle && !_.isString(req.body.libraryTitle)) return next('libraryTitle must be a string');
			next();
		})
		// }}}
		// File sanity checks {{{
		.forEach(req.files, function(next, file) {
			var rlDriver = reflib.identify(file.originalname);
			console.log(colors.blue('Upload'), colors.cyan(file.originalname), 'using driver', colors.cyan(rlDriver));
			if (file.originalname && !rlDriver) return next('File type not supported');
			next();
		})
		// }}}
		// Copy each file into a valid blob path {{{
		.set('blobIDs', [])
		.forEach(req.files, function(next, file) {
			var blobPath = temp.path({suffix: fspath.parse(file.originalname).ext, prefix: 'blob-', dir: os.tmpdir()});
			var blobID = fspath.basename(blobPath).substr(5);
			this.blobIDs.push(blobID);
			console.log(colors.blue('Upload'), colors.cyan(file.originalname), 'into blob', colors.cyan(blobID));
			copy(file.buffer, blobPath, next);
		})
		// }}}
		// Create task to actually do the work {{{
		.then('task', function(next) {
			Tasks.create({
				creator: req.user,
				worker: 'library-import',
				owner: req.user._id,
				history: [{type: 'queued'}],
				settings: {
					blobIDs: this.blobIDs,
					library: req.body.library || undefined,
					libraryTitle: req.body.libraryTitle || undefined,
					owner: req.user._id.toString(),
				},
			}, next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) {
				console.log(colors.blue('Upload'), colors.red('ERROR'), err.toString());
				return res.status(400).send(err.toString()).end();
			}
			res.send({
				_id: this.task._id,
				url: '/#/libraries/task/' + this.task._id,
			});
		});
		// }}}
});


/**
* Export a library into the provided container format
* @param string req.params.id The library ID to export
* @param string req.params.format The library output format (must be supported by Reflib)
*/
app.get('/api/libraries/:id/export/:format', function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			// if (!req.user) return next('You are not logged in');
			if (!req.params.id) return next('id must be specified');
			if (!req.params.format) return next('format must be specified');
			next();
		})
		// }}}
		.then('format', function(next) {
			var format = _.find(reflib.supported, {id: req.params.format});
			if (!format) return next('format is unsupported: ' + req.params.format);
			res.attachment(format.filename);
			next(null, format);
		})
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		// Try to determine a helpful filename {{{
		.then(function(next) {
			switch (req.params.format) {
				case 'endnotexml':
					res.attachment(this.library.title + '.xml');
					break;
				case 'json':
					res.attachment(this.library.title + '.json');
					break;
			}
			next();
		})
		// }}}
		// Stream the output via reflib {{{
		.then(function(next) {
			var library = this.library;


			reflib.output({
				format: req.params.format,
				stream: res,
				content: function(next, batch) {
					References.find({library: library._id, status: 'active'})
						.limit(config.limits.references)
						.skip(config.limits.references * batch)
						.exec(function(err, res) {
							if (err) return next(err);

							// NOTE: We have to convert Mongo's annoying objects to native plain objects here so we can clip out the weird methods that Mongo adds
							next(null, res.map(r => r.toObject()), res.length < config.limits.references);
						});
				},
			})
				.on('finish', function() {
					next();
				})
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.end();
		});
		// }}}
});


/**
* Get a list of all supproted library formats
* This really just returns the reflib.supported structure
*/
app.get('/api/libraries/formats', function(req, res) {
	res.send(reflib.supported.map(function(format) {
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
* Send a contact form email
* @param string|array req.body.email The email address of the receiver(s)
*/
app.post('/api/libraries/:id/share', function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.params.id) return next('id must be specified');
			if (!req.user) return next('You must be logged in');
			if (!req.body.email) return next('No email address(es) specified to send to');
			if (!req.body.body) return next('No email body specified');
			if (!/\[url\]/.test(req.body.body)) return next('Message must contain "[url]" somewhere');
			next();
		})
		// }}}
		// Fetch data {{{
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		// }}}
		// Send email {{{
		.then(function(next) {
			var self = this;
			email.send({
				from: req.user.name + ' <' + req.user.email + '>',
				to: req.body.email,
				subject: 'SR-Accelerator Library Share - ' + (self.library.title || 'Untitled'),
				text: req.body.body.replace('[url]', config.publicUrl + '/#/libraries/' + this.library._id),
			}, function(err) {
				if (err) return next(err);
				console.log(colors.blue('[SHARE]'), colors.cyan(self.library._id), 'With', req.body.email);
				next();
			});
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({id: this.library._id});
		});
		// }}}
});


restify.serve(app, Libraries, {
	middleware: function(req, res, next) {
		if (req.method == 'GET') return next(); // Allow all GET actions reguardless of whether the user is logged in

		if (!req.user) return res.status(400).send('You must be logged in to do that');

		// Ensure that .owners is either specified OR glue it to the query if not {{{
		if (req.user.role == 'user' && req.body.owners) {
			var owners = req.body.owners || req.query.owners;
			if (_.isString(owners)) {
				if (owners != req.user._id) return res.status(400).send('Owners must be the current user id');
			} else {
				req.query.owners = req.user._id;
			}
		}
		// }}}
		next();
	},
});
