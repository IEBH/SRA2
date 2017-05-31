/**
* SpiderCite worker
* Performs a backwards / forward citation spider search on the selected references and returns the results
*/
var _ = require('lodash');
var async = require('async-chainable');
var sraDedupe = require('sra-spider');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');
var reflibUtils = require('reflib-utils');

module.exports = function(finish, task) {
	var scanned = 0;
	var dupesFound = 0;

	async()
		// Retrieve data {{{
		.parallel({
			library: function(next) {
				Libraries.findOne({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, function(err, refs) {
					if (err) return next(err);
					next(null, references);
				});
			},
		})
		// }}}

		// Setup {{{
		.then(function(next) {
			task.history.push({type: 'status', response: 'Going to examine ' + references.length + ' references'});
			task.save(next);
		})
		// }}}

		// Calculate DOIs {{{
		.forEach('references', function(next, ref) {
			ref.doi = reflibUtils.getDOI(ref);
			next();
		})
		.then('dois', function(next) {
			var dois = this.references.filter(ref => !! ref.doi); // Remove all refs that dont have a DOI (calculated above)
			var missingCount = this.references.length - dois;

			if (missingCount) {
				task.history.push({
					type: 'error',
					response: `${missingCount} references are missing a valid DOI. These will be omitted when spidering`,
				}, err => {
					if (err) return next(err);
					next(null, dois);
				});
			} else {
				next(null, dois);
			}
		})
		// }}}

		// Spider worker {{{
		.then('cites', function(next) {
			var spider = new sraDedupe();

			spider
				.on('pmidInvalid', id => {
					console.log('Invalid PMID: ' + id);
					task.history.push({
						type: 'error',
						response: `Invalid PubMed ID: ${id}`,
					});
				})
				.exec(this.dois, next);
		})
		// }}}

		// Finish {{{
		.then(function(next) {
			task.destination = config.url + '/#/libraries/' + this.library._id + '/spider/review';
			task.completed = new Date();
			task.status = 'completed';
			task.history.push({type: 'completed', response: 'Completed spider. Scanned ' + this.dois.length + ' refs'});
			task.save(next);
		})
		.end(finish);
		// }}}
};
