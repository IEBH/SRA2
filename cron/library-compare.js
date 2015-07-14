/**
* Compare a series of libraries against one another and store the analsysis in task.result
*
* NOTE: As this task has to detect missing items task.references should contain all references within a library or else they will be reported as missing
*
* @params array task.settings.libraries List of libraries to compare (not including source library stored in task.library)
*/
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');

module.exports = function(finish, task) {
	task.references = task.references.slice(0, 10); // FIXME: Intentional truncate for testing

	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!task.settings || !task.settings.libraries || !task.settings.libraries.length) return next('No libraries specified for comparison');
			next();
		})
		// }}}
		// Worker {{{
		.then('libraries', function(next) {
			// Populate libraries structrure {{{
			var libraries = [
				{_id: task.library, library: null, references: null},
			];
			task.settings.libraries.forEach(function(id) {
				libraries.push({_id: id, library: null, references: null});
			});
			next(null, libraries);
			// }}}
		})
		.forEach('libraries', function(next, library) {
			// Populate all library entities {{{
			Libraries.findOne({_id: library._id, status: 'active'}, function(err, data) {
				if (err) return next(err);
				library.library = data;
				next();
			});
			// }}}
		})
		.forEach('libraries', function(next, library) {
			// Populate all reference entities {{{
			References.find({library: library._id, status: 'active'}, function(err, data) {
				if (err) return next(err);
				library.references = data;
				next();
			});
			// }}}
		})
		.then(function(next) {
			task.history.push({type: 'status', response: 'Going to compare ' + task.references.length + ' references'});
			task.progress.current = 0;
			task.progress.max = task.references.length;
			task.save(next);
		})
		.set('conflicts', [])
		.forEach(task.references, function(nextRef, refID) {
			var self = this;
			var libA = self.libraries[0];
			var refA = _.find(libA.references, {_id: refID});
			var conflicts = {};
			var dirty = false;
			conflicts[libA._id] = {};

			self.libraries.slice(1).forEach(function(libB) {
				conflicts[libB._id] = {};

				var refB = _.find(libB.references, function(ref) { return (ref.parentage && ref.parentage.fingerPrint && ref.parentage.fingerPrint == refA.parentage.fingerPrint) });
				if (!refB) {
					conflicts[libB._id] = 'MISSING';
					dirty = true;
				} else {
					// Simple field comparisons {{{
					['title'].forEach(function(field) {
						if (refA[field] && !refB[field]) { // A has field, B does not
							conflicts[libB._id][field] = 'MISSING';
							dirty = true;
						} else if (!refA[field] && refB[field]) { // B has field, a does not
							conflicts[libA._id][field] = 'MISSING';
							dirty = true;
						} else if (refA[field] != refB[field]) { // Fields mismatch
							conflicts[libA._id][field] = refA[field];
							conflicts[libB._id][field] = refB[field];
							dirty = true;
						}
					});
					// }}}
					// Array comparisons {{{
					['tags', 'authors'].forEach(function(field) {
						if (refA[field] && refA[field].length && (!refB[field] || !refB[field].length)) { // A has field, B does not
							conflicts[libB._id][field] = 'MISSING';
							dirty = true;
						} else if ((!refA[field] || !refA[field].length) && refB[field] && refB[field].length) { // B has field, A does not
							conflicts[libA._id][field] = 'MISSING';
							dirty = true;
						} else if ( JSON.stringify(refA[field].sort()) != JSON.stringify(refB[field].sort()) ) { // Find mismatched tags
							conflicts[libA._id][field] = refA[field];
							conflicts[libB._id][field] = refB[field];
							dirty = true;
						}
					});
					// }}}
				}
			});
			if (dirty) this.conflicts.push(conflicts);

			task.progress.current++;
			task.save(nextRef);
		})
		// }}}
		// Finish {{{
		.then(function(next) { // Finalize task data
			task.result = {
				url: config.url + '/#/libraries/' + this.libraries[0]._id + '/compare/' + task._id,
				conflicts: this.conflicts,
			};
			task.history.push({type: 'completed', response: 'Completed comparison task'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
