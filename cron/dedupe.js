/**
* Deduplicate worker
* Performs a map-reduce operation on all specified references awarding a similarity score for each
*/
var _ = require('lodash');
var async = require('async-chainable');
var compareNames = require('compare-names');
var Libraries = require('../models/libraries');
var levenshtein = require('levenshtein-dist');
var References = require('../models/references');

// Utility functions {{{
/**
* Remove reference 'noise' from a string
* @param string a The string to remove the noise from
* @return string The input string with all noise removed
*/
function stripNoise(a) {
	return a
		.replace(/[^a-z0-9]+/i, ' ')
		.replace(/ (the|a) /, ' ');
}

function compareRef(ref1, ref2) {
	// Stage 1 - Basic sanity checks - do not match if year, page, volume, isbn or number is present BUT mismatch exactly {{{
	// Since these fields are usually numeric its fairly likely that if these dont match its not a duplicate
	if (['year', 'pages', 'volume', 'number', 'isbn'].some(function(f) {
		if (ref1[f] && ref2[f]) { // Both refs possess the comparitor
			// Strip all non-numerics out {{{
			var cf1 = ref1[f].replace(/[^0-9]+/g, '');
			if (!cf1) return; // Skip out if nothing is left anyway
			var cf2 = ref2[f].replace(/[^0-9]+/g, '');
			if (!cf2) return;
			// }}}
			return cf1 != cf2;
		}
	})) return false;
	// }}}

	// Stage 2 - Comparison of title + authors {{{
	return (
		fuzzyStringCompare(ref1.title, ref2.title) &&
		compareNames(ref1.authors, ref2.authors)
	);
	// }}}
}

/**
* Fuzzily compare strings a and b
* @param string a The first string to compare
* @param string b The second string to compare
* @return boolean True if a ≈ b
*/
function fuzzyStringCompare(a, b) {
	if (a == b) return true;

	var as = stripNoise(a);
	if (as.length > 255) as = as.substr(0, 255);

	var bs = stripNoise(b);
	if (bs.length > 255) bs = bs.substr(0, 255);

	if (levenshtein(as, bs) < 10) return true;
}

// }}}


module.exports = function(finish, task) {
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
					refs.forEach(ref => references.push(ref)); // Append to array so original pointer doesnt break
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

		// Dedupe worker (outer) {{{
		.limit(config.limits.dedupeOuter)
		.forEach(references, function(nextRef, ref1, ref1Offset) { // Compare each reference...
			scanned++;
			async()
				.limit(config.limits.dedupeInner)
				.forEach(references.slice(ref1Offset + 1), function(next, ref2) { // To the references after it
					// Dedupe worker (inner - actual comparison between ref1 + ref2) {{{
					comparisons++;
					if (compareRef(ref1, ref2)) { // Is a dupe - process
						dupesFound++;
						var conflicting = {};
						// Merge conflicting keys {{{
						// For each key in either ref1 or ref2...
						_(Object.keys(ref1.toObject()).concat(Object.keys(ref2.toObject())))
							.uniq()
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
						next();
					} else { // Not a dupe - move on
						next('NOTDUPE');
					}
					// }}}
				})
				.then(function(next) { // Update progress
					task.progress.current++;
					task.save(next);
				})
				.end(function(err) {
					// Ignore NOTDUPE errors
					if (err && err != 'NOTDUPE') return nextRef(err);
					nextRef();
				});
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
