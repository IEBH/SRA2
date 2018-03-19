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
			if (!req.user || !req.user._id) return next('You are not logged in');
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
				title: req.files[0].originalname || 'Untitled RevMan file',
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
			var task = this;
			if (!_.hasIn(this.replicant, 'revman.analysesAndData.comparison')) return next('No comparisons found in the uploaded RevMan file');
			next(null, this.replicant.revman.analysesAndData.comparison.map(function(comparison) {
				return {
					id: comparison.id,
					name: comparison.name,
					selected: true,
					outcome: comparison.outcome.map(function(outcome) {
						var obj = {
							id: outcome.id,
							name: outcome.name,
						};
						if (_.isBoolean(outcome.estimable) && !outcome.estimable) {
							obj.selected = false;
							obj.selectedReason = 'Non-estimable';
						} else {
							obj.selected = true;
						}


						if (outcome.study) {
							obj.study = outcome.study.map(function(study) {
								// Fetch reference from reference store
								var ref = task.replicant.revman.studiesAndReferences.studies.includedStudies.study.find(s => s.id == study.studyId);

								return {
									id: study.studyId,
									selected: obj.selected,
									name: _.get(ref, 'reference.0.ti', study.studyId),
								};
							});
						}

						if (outcome.subgroup)
							obj.subgroup = outcome.subgroup.map(function(subgroup) {
								return {
									id: subgroup.id,
									name: subgroup.name,
									selected: obj.selected,
									study: subgroup.study ? subgroup.study.map(function(study) {
										var ref = task.replicant.revman.studiesAndReferences.studies.includedStudies.study.find(s => s.id == study.studyId);
										return {
											id: study.studyId,
											name: _.get(ref, 'reference.0.ti', study.studyId),
											selected: obj.selected,
										};
									}) : [],
								};
							});

						return obj;
					}),
				};
			}));
		})
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send({error: err});
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


app.get('/api/replicant/:id', function(req, res) {
	async()
		// Fetch data {{{
		.then('replicant', next => Replicants
			.findOne({_id: req.params.id})
			.select('_id created randomSeed title grammar')
			.exec(next)
		)
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send(this.replicant);
		});
		// }}}
});
