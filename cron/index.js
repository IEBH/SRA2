/**
* Cron core
* Used as the periodic task runner to poll the tasks collection and distribute tasks out to ./cron/*.js workers
*/

var _ = require('lodash');
var async = require('async-chainable');
var events = require('events');
var Tasks = require('../models/tasks');
var request = require('superagent');
var requireDir = require('require-dir');
var util = require('util');

function Cron() {
	this.workers = requireDir('.');

	this.cycle = function(finish) {
		var self = this;

		async()
			.set({
				toProcess: 0,
				processed: 0,
			})
			.then('tasks', function(next) {
				Tasks.find({status: 'pending'})
					.limit(config.cron.queryLimit) // Scoop out only so many records at a time
					.sort('touched')
					.exec(next);
			})
			.then(function(next) {
				this.toProcess = this.tasks.length;
				if (!this.toProcess) return next('Nothing to do');
				next();
			})
			.forEach('tasks', function(nextItem, item) {
				var outer = this;
				async()
					.then(function(next) {
						// Sanity Checks {{{
						if (!self.workers[item.worker]) return next('Unknown worker: ' + item.worker);
						if (item.status != 'pending') return next('Grabbed task with invalid status: ' + item.status);
						next();
						// }}}
					})
					.then(function(next) { // Mark as processing so the next cycle doesn't grab it
						item.status = 'processing';
						item.save(next);
					})
					.then(function(next) {
						self.workers[item.worker](next, item);
					})
					.then(function(next) {
						outer.processed++;
						item.touched = new Date();
						item.status = 'completed';
						item.save(next);
					})
					.end(function(err) {
						if (err) {
							self.emit('err', err);
							item.status = 'error';
							item.history.push({
								type: 'error',
								response: err.toString(),
							});
							item.save(nextItem);
						} else {
							nextItem();
						}
					});
			})
			.end(function(err) {
				if (err) self.emit('err', err);
				if (this.toProcess) self.emit('info', this.processed.toString() + '/' + this.toProcess.toString() + ' profiles processed');

				if (!this.toProcess) {
					self.emit('idle', 'Nothing to do');
				} else if (err) {
					self.emit('info', 'Cron Error - ' + err);
				}

				finish();
			});
	};

	this.install = function() {
		var self = this;
		// Cron runner process {{{
		var cronRunner = function() {
			setTimeout(function() {
				// self.emit('info', 'Beginning cron cycle');
				self.cycle(function() {
					// self.emit('info', 'Cycle complete');
					cronRunner();
				});
			}, config.cron.waitTime);
		};
		// }}}
		async()
			.then(function(next) {
				// Restart all partially completed tasks as pending
				Tasks.update({status: 'processing'}, {status: 'pending'}, next);
			})
			.then(function(next) {
				cronRunner();
				next();
			})
			.end(function(err) {
				if (err) throw new Error(err);
				self.emit('info', 'Installed');
			});
	};
}

util.inherits(Cron, events.EventEmitter);
module.exports = new Cron();
