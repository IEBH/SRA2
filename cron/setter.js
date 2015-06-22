/**
* Setter worker
* Applies a field mask to all references within a library
* This worker is used for debugging the task worker and reporting system
* @param object task.settings The mask to set
*/
var async = require('async-chainable');
var colors = require('colors');
var References = require('../models/references');

module.exports = function(finish, task) {
	async()
		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = 1;
			task.history.push({type: 'status', response: 'Setting mask: ' + JSON.stringify(task.settings)});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.then(function(next) {
			References.count({
				library: task.library,
				status: 'active',
				_id: {'$in': task.references},
			}, function(err, count) {
				if (err) return next (err);
				task.history.push({type: 'status', response: 'Updating ' + count + ' matching references'});
				task.save(next);
			})
		})

		.then(function(next) {
			References.update({
				library: task.library,
				status: 'active',
				_id: {'$in': task.references},
			}, task.settings, {multi: true}, next)
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.progress.current = 1;
			task.history.push({type: 'completed', response: 'Completed setter task'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
