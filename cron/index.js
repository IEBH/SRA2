/**
* Cron core
* Used as the periodic task runner to poll the processQueue and distribute tasks out to ./cron/*.js
*/

var _ = require('lodash');
var async = require('async-chainable');
var events = require('events');
var ProcessQueue = require('../models/processQueue');
var request = require('superagent');
var util = require('util');

function Cron() {
	this.workers = {
		dummy: require('./dummy'),
		fulltext: require('./fulltext'),
	};

	this.cycle = function(finish) {
		var self = this;

		async()
			.set({
				toProcess: 0,
				processed: 0,
			})
			.then('queue', function(next) {
				ProcessQueue.find({status: 'pending'})
					.limit(config.cron.queryLimit) // Scoop out only so many records at a time
					.sort('touched')
					.exec(next);
			})
			.then(function(next) {
				this.toProcess = this.queue.length;
				if (!this.toProcess) return next('Nothing to do');
				next();
			})
			.forEach('queue', function(nextItem, item) {
				var outer = this;
				async()
					.then(function(next) {
						// Sanity Checks {{{
						if (!self.workers[item.operation]) return next('Unknown operation: ' + item.operation);
						next();
						// }}}
					})
					.then('alteredItem', function(next) {
						self.workers[item.operation](next, item);
					})
					.then(function(next) {
						outer.processed++;
						item.touched = new Date();
						item.save(next);
					})
					.end(nextItem);
			})
			.end(function(err) {
				self.emit('info', this.processed.toString() + '/' + this.toProcess.toString() + ' profiles processed');
				if (!this.toProcess) {
					self.emit('info', 'Nothing to do');
				} else if (err) {
					self.emit('info', 'Cron Error - ' + err);
				}

				finish();
			});
	};

	this.install = function() {
		var self = this;
		self.emit('info', 'Installed');
		var cronRunner = function() {
			setTimeout(function() {
				self.emit('info', 'Beginning cron cycle');
				self.cycle(function() {
					self.emit('info', 'Cycle complete');
					cronRunner();
				});
			}, config.cron.waitTime);
		};
		cronRunner();
	};
}

util.inherits(Cron, events.EventEmitter);
module.exports = new Cron();
