/**
* Deduplicate worker
* Performs a map-reduce operation on all specified references awarding a similarity score for each
*/
var _ = require('lodash');
var async = require('async-chainable');
var sraDedupe = require('sra-dedupe');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');

module.exports = function(finish, task) {
	var dedupe = sraDedupe();
	var references = [];
	var scanned = 0;
	var comparisons = 0;
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
					refs.forEach(ref => references.push(ref)); // Push to references so the pointer doesnt break
					next(null, references);
				});
			},
		})
		// }}}

		// Setup {{{
		.parallel([
			function(next) { // Setup task data
				task.progress.current = 0;
				task.progress.max = references.length;
				task.history.push({type: 'status', response: 'Going to examine ' + references.length + ' references'});
				task.save(next);
			},
			function(next) { // Setup library state
				this.library.dedupeStatus = 'processing';
				this.library.save(next);
			},
		])
		// }}}

		// Clear existing duplicate data (if any) {{{
		.limit(1)
		.forEach(references, function(next, ref) {
			if (ref.status == 'dupe') ref.status = 'active';
			if (ref.duplicateData.length) ref.duplicateData = [];
			if (!ref.isModified()) return next(); // Nothing to do
			ref.save(next);
		})
		// }}}

		// Dedupe worker {{{
		.limit(config.tasks.dedupe.limit)
		.forEach(references, function(nextRef, ref1, ref1Offset) { // Compare each reference...
			scanned++;

			references
				.slice(ref1Offset+1)
				.forEach(function(ref2, ref2Offset) {
					// console.log('COMPARE', ref1._id, ref1Offset, 'AGAINST', ref2._id, ref2Offset);
					comparisons++;
					if (!dedupe.compare(ref1, ref2).isDupe) return; // Is not a dupe - ignore
					dupesFound++;
					// Merge conflicting keys {{{
					// For each key in either ref1 or ref2...
					var conflicting = {};
					_(_.keys(ref1.toObject()).concat(_.keys(ref2.toObject())))
						.filter(function(key) {
							// Don't try to merge if the key is...
							return ! (
								_.startsWith(key, '_') ||
								key == 'duplicateData' ||
								key == 'created' ||
								key == 'edited' ||
								key == 'library' ||
								key == 'status' ||
								key == 'tags'
							);
						})
						.uniq()
						.forEach(function(key) {
							if (ref1[key] && !ref2[key]) { // Ref1 has the key ref2 does not
								// Pass
							} else if (!ref1[key] && ref2[key]) { // Ref 1 does not have the key ref2 does
								ref1[key] = ref2[key];
							} else if (!_.isEqual(ref1[key], ref2[key])) { // Both have the key and it conflicts
								conflicting[key] = ref2[key];
							}
						});
					ref1.duplicateData.push({reference: ref2._id, conflicting: conflicting});
					ref2.status = 'dupe';
					// }}}
				});

			task.progress.current++;
			task.save(nextRef);
			console.log(colors.blue('DEDUPE'), 'Lib:', colors.cyan(this.library._id), '@', task.progress.current + '/' + references.length + ' = ' + colors.cyan(Math.ceil((task.progress.current / references.length) * 100) + '%'), 'deduped with', colors.cyan(dupesFound), 'dupes found');
		})
		// }}}

		// Save everything {{{
		.limit(1)
		.forEach(references, function(next, ref) {
			if (!ref.isModified() && !ref.duplicateData.length) return next(); // Nothing to do

			if (ref.duplicateData.length) { // This ref is the master for a few dupes
				var originalFields = {};

				ref.duplicateData.forEach(dup => { // Scan each duplicate
					_.keys(dup.conflicting).forEach(k => originalFields[k] = ref[k]); // Copy the original into storage
				});

				// Make sure that it is the first item in the duplicateData list
				ref.duplicateData.unshift({
					reference: ref._id,
					conflicting: originalFields,
				});
			}
			ref.save(next);
		})
		// }}}

		// Finish {{{
		.parallel([
			function(next) { // Finalize task data
				task.destination = config.url + '/#/libraries/' + this.library._id + '/dedupe/review';
				task.completed = new Date();
				task.status = 'completed';
				task.history.push({type: 'completed', response: 'Completed dedupe. Scanned ' + scanned + ' with ' + comparisons + ' comparisons. Which found ' + dupesFound + ' dupes'});
				task.save(next);
			},

			function(next) { // Finalize library state
				this.library.dedupeStatus = 'review';
				this.library.save(next);
			},
		])
		.end(finish);
		// }}}
};
