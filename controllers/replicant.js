var _ = require('lodash');
var async = require('async-chainable');
var multer = require('multer');
var revmanCache = require('cache-manager').caching({
	store: require('cache-manager-fs'),
	options: {
		ttl: 60 * 12,
		path: '/tmp/replicantCache',
	},
});
var revman = require('revman');
var revmanReplicant = require('revman-replicant');
var uuid = require('uuid');

/**
* Accept a file, convert it via the revman module into a data structure and return its cache ID
* @param req.files[0] The file to import
* @return {Object} Object of the form `{id: String, url: String}`
*/
app.post('/api/replicant/import', multer().any(), function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.files) return next('No files were uploaded');
			if (req.files.length > 1) return next('Only one file is allowed at a time');
			next();
		})
		// }}}
		// Convert file to RevMan object
		.then('converted', next => revman.parse(req.files[0].buffer.toString(), next))
		// }}}
		// Generate ID {{{
		.then('uuid', next => next(null, uuid.v4()))
		// }}}
		// Store in cache {{{
		.then(function(next) {
			revmanCache.set(this.uuid, this.converted, next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({
				id: this.uuid,
				url: '/#/replicant/' + this.uuid,
			});
		});
		// }}}
});

/**
* Get the abbreviated `./analysesAndData/comparison[]` collection for a given revman ID
* @param req.params.id The ID of the cache item to examine
* @return {array} Array of studies within the revman data structure
*/
app.get('/api/replicant/:id/comparisons', function(req, res) {
	async()
		// Get from cache {{{
		.then('revman', function(next) {
			revmanCache.get(req.params.id, {}, next);
		})
		.then(function(next) {
			if (_.isEmpty(this.revman)) return next('Not found');
			next();
		})
		// }}}
		.then('studies', function(next) {
			next(null, this.revman.analysesAndData.comparison.map(function(comparison) {
				return {
					id: comparison.id,
					name: comparison.name,
					comparisons: comparison.dichOutcome.map(function(study) {
						return {
							id: study.id,
							name: study.name,
							subComparisons: study.dichSubgroup ? study.dichSubgroup.map(function(subComparison) {
								return {
									id: subComparison.id,
									name: subComparison.name,
								};
							}) : [],
						};
					}),
				};
			}));
		})
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send(this.studies);
		})
		// }}}
});


app.get('/api/replicant/grammars', function(req, res) {
	res.send(require(config.root + '/node_modules/revman-replicant/grammars/index.json'));
});
