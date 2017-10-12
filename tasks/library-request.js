var _ = require('lodash');
var async = require('async-chainable');
var email = require('mfdc-email');
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
					.on('requestRetry', (ref, attempt, tryAgainInTimeout) => {
						task.history.push({type: 'queued', response: `request failed (attempt #${attempt}) for "${ref.title}" retry in ${tryAgainInTimeout}ms`})
					})
					.on('requestFailed', (ref, attempt) => {
						task.history.push({type: 'error', response: `request failed (after ${attempt} attempts) for "${ref.title}"`})
					})
					.on('requestError', (ref, err) => {
						task.history.push({type: 'error', response: `request error for "${ref.title}" - ${err.toString()}`})
					})
					.on('requestSucceed', (ref, err) => {
						task.history.push({type: 'completed', response: `request complete for "${ref.title}"`})
					})

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

			async()
				.set('errorCount', this.errorCount)
				.set('requester', this.requester)
				// Make the request {{{
				.then('responseSent', function(next) {
					if (!config.request.exlibrisSettings.enabled) return next(null, false);
					this.requester.request(ref.toObject(), (err, res) => {
						return next(null, !err);
					});
				})
				// }}}
				// Log errors {{{
				.then(function(next) {
					if (this.responseSent) return next();
					task.history.push({type: 'error', response: `Resource request rejected - '${ref.title}'`});
					this.errorCount++;
					next();
				})
				// }}}
				// Send email about the reference failing if that feature is enabled
				.then(function(next) {
					if (this.responseSent) return next();
					if (!config.request.fallbackEmail.enabled) return next(`Reference submission failed with no fallback left to try - ${ref.title}`);

					email()
						.to(config.request.fallbackEmail.to)
						.subject(config.request.fallbackEmail.subject(ref))
						.set('html', true)
						.template(__dirname + '/../views/email/library-request-fallback.html')
						.templateParams({
							ref: ref,
							user: task.settings.user,
						})
						.send(next)
				})
				// }}}
				// Save progress {{{
				.then(function(next) {
					task.progress.current++;
					task.save(next); // Ignore individual errors
				})
				// }}}
				.end(nextRef)
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
