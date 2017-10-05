var _ = require('lodash');
var async = require('async-chainable');
var email = require('../lib/email');
var Libraries = require('../models/libraries');
var moment = require('moment');
var References = require('../models/references');
var sraExlibrisRequest = require('sra-exlibris-request');

module.exports = function(finish, task) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!task.settings) return next('.settings object must be present for request');
			if (!task.settings.user) return next('.settings.user object must be present for request');
			if (!task.settings.user.email) return next('.settings.user object must be have an email');
			if (!task.settings.user.email.endsWith('bond.edu.au')) return next('Email address must end with "bond.edu.au"');
			next();
		})
		// }}}

		// Retrieve data {{{
		.parallel({
			library: function(next) {
				Libraries.find({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, next);
			},
			historyTask: function(next) {
				task.progress.current = 0;
				task.progress.max = task.references.length;
				task.history.push({type: 'status', response: `Going to request ${task.references.length} references`});
				next();
			},
			requester: function(next) {
				next(null, new sraExlibrisRequest()
					.set(config.request.exlibrisSettings)
					.set('user.email', task.settings.user.email.toLowerCase())
				);
			},
		})
		// }}}

		// Final sanity checks {{{
		.then(function(next) {
			if (!config.request.maxReferences) return next();
			if (this.references.length > config.request.maxReferences) return next(`Refusing to submit ${this.references.length} journal requests. ${config.request.maxReferences} is the maximum allowed.`);
			next();
		})
		// }}}

		// Send requests {{{
		.set('errorCount', 0)
		.forEach('references', function(nextRef, ref) {
			this.requester.request(ref, (err, res) => {
				if (err) {
					task.history.push({type: 'error', response: err.toString()});
					this.errorCount++;
				} else {
					task.history.push({type: 'response', response: this.response});
				}
				task.progress.current++;
				task.save(nextRef); // Ignore individual errors
			});
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			if (this.errorCount > 0) {
				task.history.push({type: 'completed', response: `Completed request operation but ${this.errorCount} errors were reported`});
				task.completed = new Date();
				task.status = 'error';
			} else {
				task.history.push({type: 'completed', response: 'Completed request operation'});
				task.completed = new Date();
				task.status = 'completed';
			}
			task.save(next);
		})
		.end(finish);
		// }}}
};
