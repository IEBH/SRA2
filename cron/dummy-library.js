/**
* DummyLibrary worker
* Pauses for 10 seconds (reguardless of reference count) to give the impression its working
* This worker is used for debugging the task worker and reporting system
*/
var async = require('async-chainable');
var colors = require('colors');

module.exports = function(finish, task) {
	async()
		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = 100;
			task.history.push({type: 'status', response: 'Pretending to examine ' + task.references.length + ' references'});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.then(function(next) {
			console.log(colors.blue('[DummyLibrary worker]'), 'Pretending to work for 10 seconds');
			var tick = function() {
				task.progress.current++;
				task.save(function(err) {
					if (err) return next(err);
					if (task.progress.current >= task.progress.max) return next();
					setTimeout(tick, 10);
				});
			};
			tick();
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.history.push({type: 'completed', response: 'Completed dummyLibrary task'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
