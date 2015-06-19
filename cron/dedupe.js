/**
* Deduplicate worker
* Performs a map-reduce operation on all specified references awarding a similarity score for each
*/
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
			var cf1 = ref1[f].replace(/[^0-9]+/, '');
			if (!cf1) return; // Skip out if nothing is left anyway
			var cf2 = ref2[f].replace(/[^0-9]+/, '');
			if (!cf2) return;
			// }}}
			return cf1 != cf2;
		}
	}) return false;
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
		.parallel([
			function(next) { // Setup task data
				task.progress.current = 0;
				task.progress.max = task.references.length;
				task.history.push({type: 'status', response: 'Going to examine ' + task.references.length + ' references'});
				task.save(next);
			},
			function(next) { // Setup library state
				this.library.dedupeStatus = 'processing';
				this.library.save(next);
			},
		])
		// }}}

		// Dedupe worker (outer) {{{
		.limit(config.limits.dedupeOuter)
		.forEach('references', function(nextRef, ref1, ref1Offset) { // Compare each reference...
			var self = this;
			async()
				.limit(config.limits.dedupeInner)
				.forEach(self.references.slice(ref1Offset + 1), function(next, ref2) { // To the references after it
					// Dedupe worker (inner - actual comparison between ref1 + ref2) {{{
					if (compareRef(ref1, ref2)) { // Is a dupe - process
						// Append duplicateData structure onto ref1 if its not already present {{{
						if (!ref1.duplicateData) ref1.duplicateData = [];
						var dupData = {reference: ref2._id, conflicting: {}};
						ref1.duplicateData.push(dupData);
						// }}}
						// Merge conflicting keys {{{
						// For each key in either ref1 or ref2...
						_(Object.keys(ref1).concat(Object.keys(ref2)))
							.uniq()
							.filter(function(key) {
								// Don't try to merge if the key is...
								if (
									key.substr(0, 1) == '_') ||
									key == 'duplicateData' ||
									key == 'created' ||
									key == 'edited' ||
									key == 'library' ||
									key == 'status' ||
									key == 'tags'
								) return false;
								return true;
							})
							.forEach(function(key) {
								if (ref1[key] && !ref2[key]) { // Ref1 has the key ref2 does not
									// Pass
								} else if (!ref1[key] && ref2[key]) { // Ref 1 does not have the key ref2 does
									ref1[key] = ref2[key];
								} else if (!_.isEqual(ref1[key], ref2[key])) { // Both have the key and it conflicts
									dupData.conflicting[key] = ref2[key];
								}
							});
						// }}}
						// Save ref1 / ref2 {{{
						async()
							.parallel([
								function(next) {
									ref1.save(next);
								}),
								function(next) {
									ref2.status = 'dupe';
									ref2.save(next);
								})
							])
							.end(nextRef);
						// }}}
					} else { // Not a dupe - move on
						nextRef();
					}
					// }}}
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
				this.library.dedupeStatus = 'review';
				this.library.save(next);
			},
		])
		.end(finish);
		// }}}
};
