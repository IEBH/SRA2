/**
* Dummy worker
* Pauses for 10 seconds for each reference provided to give the impression its working
* This worker is used for debugging the task worker and reporting system
*/
var async = require('async-chainable');
var colors = require('colors');

module.exports = function(finish, task) {
	async()
		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = task.references.length;
			task.history.push({type: 'status', response: 'Going to examine ' + task.references.length + ' references'});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.limit(1)
		.forEach(task.references, function(nextRef, ref, ref1Offset) { // Process each reference...
			async()
				.then(function(next) {
					console.log(colors.blue('[Dummy worker]'), 'Pretending to work on reference', colors.cyan(ref));
					next();
				})
				.then(function(next) {
					setTimeout(next, 10 * 1000);
				})
				.then(function(next) {
					task.history.push({type: 'response', response: 'Processed ref ' + ref._id});
					task.progress.current++;
					task.save(next);
				})
				.end(nextRef);
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.history.push({type: 'completed', response: 'Completed dummy task'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
