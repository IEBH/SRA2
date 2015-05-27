/**
* Deduplicate worker
* Performs a map-reduce operation on all specified references awarding a similarity score for each
*/
var async = require('async-chainable');
var Libraries = require('../models/libraries');
var References = require('../models/references');

module.exports = function(finish, task) {
	async()
		// Retrieve data {{{
		.parallel({
			library:, function(next) {
				Library.find({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, next);
			},
		})
		// }}}

		// Setup {{{
		.parallel([
			function(next) { // Setup task data
				task.progress.current = 0;
				task.progress.max = task.references.length;
				task.history.push({type: 'status', response: 'Going to examine ' + task.references.length + ' references'});
				task.save(next);
			},
			function(next) { // Setup library state
				library.dedupeStatus = 'processing';
				library.save(next);
			},
		])
		// }}}

		// Dedupe worker {{{
		.limit(config.limits.dedupeOuter)
		.forEach('references', function(nextRef, ref1, ref1Offset) { // Compare each reference...
			var self = this;
			async()
				.limit(config.limits.dedupeInner)
				.forEach(self.references.slice(ref1Offset + 1), function(next, ref2) { // To the references after it
					console.log('COMPARE', ref1._id, ref2._id);
					setTimeout(function() {
						next();
					}, Math.random() * 5000);
				})
				.then(function(next) { // Update progress
					task.progress.current++;
					task.save(next);
				})
				.end(nextRef);
		})
		// }}}

		// Finish {{{
		.parallel([
			function(next) { // Finalize task data
				task.history.push({type: 'completed', response: 'Completed dedupe'});
				task.save(next);
			},

			function(next) { // Finalize library state
				library.dedupeStatus = 'review';
				library.save(next);
			},
		])
		.end(finish);
		// }}}
};
