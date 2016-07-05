var _ = require('lodash');
var async = require('async-chainable');
var multer = require('multer');
var Replicants = require('../models/replicants');
var revman = require('revman');
var revmanReplicant = require('revman-replicant');

/**
* Accept a file, convert it via the revman module into a data structure and return its ID
* @param req.files[0] The file to import
* @return {Object} Object of the form `{id: String, url: String}`
*/
app.post('/api/replicant/import', multer().any(), function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.files) return next('No files were uploaded');
			if (!req.user._id) return next('You are not logged in');
			if (req.files.length > 1) return next('Only one file is allowed at a time');
			next();
		})
		// }}}
		// Convert file to RevMan object
		.then('converted', next => revman.parse(req.files[0].buffer.toString(), next))
		// }}}
		// Create document {{{
		.then('replicant', function(next) {
			Replicants.create({
				owner: req.user._id,
				revman: this.converted,
			}, next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({
				_id: this.replicant._id,
				url: '/#/replicant/' + this.replicant._id,
			});
		});
		// }}}
});

/**
* Get the abbreviated `./analysesAndData/comparison[]` collection for a given revman ID
* @param req.params.id The ID of the item to examine
* @return {array} Array of studies within the revman data structure
*/
app.get('/api/replicant/:id/comparisons', function(req, res) {
	async()
		// Fetch data {{{
		.then('replicant', next => Replicants.findOne({_id: req.params.id}, next))
		// }}}
		.then('studies', function(next) {
			next(null, this.replicant.revman.analysesAndData.comparison.map(function(comparison) {
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


/**
* Save an objects details
*/
// FIXME: This is currently a patch method - change this back to .post when Monoxide gets merged - MC 2016-07-05
app.patch('/api/replicant/:id', function(req, res) {
	async()
		// Fetch data {{{
		.then('replicant', next => Replicants.findOne({_id: req.params.id}, next))
		// }}}
		// Save data {{{
		.then(function(next) {
			_.extend(this.replicant, _.pick(req.body, ['grammar', 'primary']));
			this.replicant.save(next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({
				_id: this.replicant._id,
				url: '/#/replicant/' + this.replicant._id,
			});
		});
		// }}}
});


/**
* Generate an abstract via RevMan-Replicant using the ID of the Replicant object and the provided settings
* @param {boolean} [req.query.randomize=false] Whether to rescamble the random seed (if false the same result will be generated each time)
*/
app.get('/api/replicant/:id/generate', function(req, res) {
	async()
		// Fetch data {{{
		.then('replicant', next => Replicants.findOne({_id: req.params.id}, next))
		// }}}
		// Rengerate random seed? {{{
		.then(function(next) {
			if (!req.query.randomize) return next();
			this.replicant.randomSeed = _.random(1, 9999999);
			this.replicant.save(next);
		})
		// }}}
		// Generate {{{
		.then('content', function(next) {
			revmanReplicant({
				seed: this.replicant.randomSeed,
				revman: this.replicant.revman,
				grammar: config.root + '/node_modules/revman-replicant/grammars/' + this.replicant.grammar,
			}, next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({
				_id: this.replicant._id,
				randomSeed: this.replicant.randomSeed || 0,
				content: this.content,
			});
		});
		// }}}
});


app.get('/api/replicant/grammars', function(req, res) {
	res.send(require(config.root + '/node_modules/revman-replicant/grammars/index.json'));
});
