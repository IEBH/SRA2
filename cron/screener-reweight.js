/**
* Screening reweight
* Scans a reference and reapplys the weighting based on the keywords attached to the library.screening.weightings collection
*/
var _ = require('lodash')
	.mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var colors = require('colors');
var sha1 = require('sha1');

module.exports = function(finish, task) {
	async()
		// Retrieve data {{{
		.parallel({
			library: function(next) {
				Libraries.findOne({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, next);
			},
		})
		// }}}

		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = task.references.length;
			task.history.push({type: 'status', response: 'Reweighting ' + task.references.length + ' references'});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.then('hash', function(next) {
			// Compute a hash for this weighting session
			// This will be stored in the library.screening.lastWeighting.hash and also each references.screening.hash
			// The hash is used to determine whether this process needs a no run (if library.screening.lastWeighting.hash matches), a partial run (mismatch but each reference is then examined), or a full run (like before but assumes every reference mismatches)
			var weightingObj = {};
			this.library.screening.weightings.forEach(function(weighting) {
				weightingObj[weighting.keyword] = weighting.weight;
			});
			weightingsObj = _.keyArrange(weightingObj);
			next(null, sha1(JSON.stringify(weightingsObj)));
		})
		.then(function(next) {
			// Determine if we should do anything at all {{{
			if (
				library.screening.lastWeighting.hash &&
				library.screening.lastWeighting.hash == this.hash
			) return next('No rerun needed - hash already matches previous run on ' + library.screening.lastWeighting.date);
			next();
			// }}}
		})

		.forEach(this.references, function(nextRef, ref) { // Process each reference...
			if (ref.screening.hash == this.hash) return next(); // No need to re-examine as the hash already matches

			var words = _.words(ref.abstract);
			var score = 0;
			
			this.library.screening.weightings.forEach(function(weighting) {
				var hasKeyword = _.indexOf(words, weighting.keywords);
				if (hasKeyword) score += weighting.weight;
			});

			ref.screening.hash = this.hash;
			ref.screening.weight = score;
			ref.screening.save(nextRef);
		})
		// }}}

		// Finish {{{
		.parallel([
			function(next) { // Finalize task data
				task.history.push({type: 'completed', response: 'Completed task'});
				task.completed = new Date();
				task.status = 'completed';
				task.save(next);
			},
			function(next) { // Save screening data back to library
				library.screening.lastWeighting.date = new Date();
				library.screening.lastWeighting.hash = this.hash;
				library.save(next);
			},
		])
		.end(function(err) {
			if (/^No rerun needed/.test(err)) { // Rewrite no-reun errors as success
				task.history.push({type: 'completed', response: err});
				task.completed = new Date();
				task.status = 'completed';
				task.save(next);
				return finish();
			}
			finish(err);
		});
		// }}}
};
