var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var email = require('email').Email;
var fs = require('fs');
var Libraries = require('../models/libraries');
var moment = require('moment');
var References = require('../models/references');
var ReferenceTags = require('../models/referenceTags');
var rl = require('reflib');
var strtotime = require('strtotime');

/**
* Accept a file and upload it either into a new or existing library
* @param array req.files Array of files to process
* @param string req.body.libraryId The library ID to upload into, if omitted a new one is created (using req.body.library)
* @param object req.body.library Library prototype object to create (e.g. 'title')
* @param object req.body.libraryTitle Alternate method to populate library.title within a POST operation
* @param string req.body.json If set the created (or modified) library record is returned instead of redirecting to the library page
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
			console.log(colors.blue('Upload'), file.originalname, 'using driver', rl.identify(file.originalname));
			if (file.originalname && !rl.identify(file.originalname)) return next('File type not supported');
			next();
			// }}}
		})
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
		.set('refs', []) // References to create
		.set('tags', {}) // Lookup array for tags
		.forEach(req.files, function(next, file) {
			var self = this;
			rl.parse(rl.identify(file.originalname) || 'endnotexml', fs.readFileSync(file.path))
				.on('error', function(err) {
					next(err);
				})
				.on('ref', function(ref) {
					ref.library = self.library._id;
					if (ref.tags) ref.tags.forEach(function(tag) { self.tags[tag] = true });
					self.refs.push(_.omit(ref, ['_id', 'created', 'edited', 'status']));
					self.count++;
				})
				.on('end', function() {
					next();
				});
		})
		.limit(50)
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
		.forEach('refs', function(nextRef, ref) {
			var self = this;
			if (ref.tags) ref.tags = ref.tags.map(function(tag) { return self.tags[tag]._id })
			References.create(ref, nextRef);
		})
		.end(function(err) {
			if (err) return res.status(400).send(err).end();
			console.log(colors.blue('Upload complete'), 'imported', colors.cyan(this.count), 'items');
			if (req.body.json) return res.send(this.library);
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
* Send a contact form email
* @param string|array req.body.email The email address of the receiver(s)
*/
app.post('/api/libraries/:id/share', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.params.id) return next('id must be specified');
			if (!req.user) return next('You must be logged in');
			if (!req.body.email) return next('No email address(es) specified to send to');
			if (!req.body.body) return next('No email body specified');
			next();
			// }}}
		})
		.then('library', function(next) {
			Libraries.findOne({_id: req.params.id, status: 'active'}, next);
		})
		.then(function(next) {
			var self = this;
			new email({
				from: req.user.name + ' <' + req.user.email + '>',
				to: _.isArray(req.body.email) ? req.body.email.join('; ') : req.body.email,
				subject: 'CREP-SRA Library Share - ' + (self.library.title || 'Untitled'),
				body: req.body.body,
				bodyType: 'text/plain',
			}).send(function(err) {
				if (err) return next(err);
				console.log(colors.blue('[SHARE]'), colors.cyan(self.library._id), 'With', req.body.email);
				next();
			});
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({id: this.library._id});
		});
});


restify.serve(app, Libraries, {
	lean: false,
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
