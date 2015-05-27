/**
* Dummy worker
* Pauses for 5 seconds for each reference provided to give the impression its working
* This worker is used for debugging the task worker and reporting system
*/
var async = require('async-chainable');

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

		// Dedupe worker {{{
		.limit(config.limits.dummy)
		.forEach('references', function(nextRef, ref, ref1Offset) { // Process each reference...
			console.log(colors.blue('[Dummy worker]'), 'Pretending to work on reference', colors.cyan(ref));
			setTimeout(nextRef, 5000);
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.history.push({type: 'completed', response: 'Completed dummy task'});
			task.save(next);
		})
		.end(finish);
		// }}}
};
