/**
* library-cleaner
* Erases all libraries when their expiry date is over
* This worker is used for debugging the task worker and reporting system
*/
var async = require('async-chainable');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');

module.exports = function(finish, task) {
	async()
		.set('count', 0)
		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = 100;
			task.history.push({type: 'status', response: 'Beginning cleaning'});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.then('libraries', function(next) {
			Libraries.find({
				expiry: {'$lt': (new Date)},
				status: 'active',
			}, next);
		})
		.then(function(next) {
			if (!this.libraries.length) return next();

			console.log(colors.blue('[Library cleaner]'), this.libraries.length + ' libraries to clean');
			task.progress.max = this.libraries.length * 2; // references + libraries
			task.save(next);
		})
		.forEach('libraries', function(next, library) {
			References.remove({library: library._id}, {multi: true}, function(err) {
				if (err) return next(err);
				task.progress.current++;
				task.save(next);
			});
		})
		.forEach('libraries', function(next, library) {
			var self = this;
			Libraries.remove({_id: library._id}, function(err) {
				if (err) return next(err);
				task.progress.current++;
				self.count++;
				task.save(next);
			});
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.history.push({type: 'completed', response: 'Finished cleaning. ' + this.count + ' libraries cleaned up'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
