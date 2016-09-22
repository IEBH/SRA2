/**
* Task core
* Used as the periodic task runner to poll the tasks collection and distribute tasks out to ./tasks/*.js workers
*/

var _ = require('lodash');
var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');
var colors = require('colors');
var events = require('events');
var moment = require('moment');
var pm2 = require('pm2');
var Tasks = require('../models/tasks');
var request = require('superagent');
var requireDir = require('require-dir');
var util = require('util');

function Task() {
	this.workers = requireDir('.');

	this.cycle = function(finish) {
		var self = this;

		async()
			.set({
				toProcess: 0,
				processed: 0,
				processNames: [],
			})
			// Clean up PM2 tasks {{{
			.then(function(next) {
				if (config.tasks.runMode != 'pm2') return next();
				async()
					.then('pm2', function(next) {
						pm2.connect(next);
					})
					.then('pm2Procs', function(next) {
						pm2.list(next);
					})
					.forEach('pm2Procs', function(next, pm2Proc) {
						if (!/^sra-task-/.test(pm2Proc.name)) return next();
						if (pm2Proc.pm2_env.status == 'stopped') {
							if (moment(pm2Proc.pm2_env.created_at).isAfter(moment().subtract(10, 'minutes'))) {
								console.log(colors.blue('[PM2]'), 'Clean up process', colors.cyan(pm2Proc.name));
								pm2.delete(pm2Proc.name, next);
							} else {
								console.log(colors.blue('[PM2]'), 'Process', colors.cyan(pm2Proc.name), 'stopped but not old enough for cleaning');
								next();
							}
						} else {
							console.log(colors.blue('[PM2]'), 'Process', colors.cyan(pm2Proc.name), 'status is', colors.cyan(pm2Proc.pm2_env.status));
							next();
						}
					})
					.end(function(err) {
						if (err) {
							pm2.disconnect(function() {
								next('PM2 cleanup err: ' + err.toString());
							});
						} else {
							pm2.disconnect(next);
						}
					});
			})
			// }}}
			.then('tasks', function(next) {
				Tasks.find({status: 'pending'})
					.limit(config.tasks.queryLimit) // Scoop out only so many records at a time
					.sort('touched')
					.exec(next);
			})
			.then(function(next) {
				this.toProcess = this.tasks.length;
				if (!this.toProcess) return next('Nothing to do');
				next();
			})
			.then(function(next) {
				if (config.tasks.runMode != 'pm2') return next();
				pm2.connect(next);
			})
			.forEach('tasks', function(nextTask, task) {
				var outer = this;
				if (!self.workers[task.worker]) return next('Unknown worker: ' + task.worker);
				if (task.status != 'pending') return next('Grabbed task with invalid status: ' + task.status);

				console.log(colors.blue('[Tasks]'), 'Launch task', colors.cyan(task._id), 'with worker', colors.cyan(task.worker));

				switch (config.tasks.runMode) {
					case 'pm2':
						pm2.start({
							name: 'sra-task-' + task.worker + '-' + task._id,
							script: './runtask.js',
							args: ['-t', task._id],
							autorestart: false,
							env: {NODE_ENV: config.env},
						}, function(err) {
							if (err) return nextTask(err);
							outer.processed++;
							outer.processNames.push(task.worker);
							nextTask();
						});
						break;
					case 'inline':
						async()
							.use(asyncExec)
							.execDefaults({
								log: function(cmd) { console.log(colors.blue('[Tasks]', 'RUN'), cmd.cmd + ' ' + cmd.params.join(' ')) },
								out: function(data) { console.log(colors.blue('[Tasks]', '-->'), data) }
							})
							.exec([
								'node',
								'./runtask.js',
								'--task',
								task._id,
							])
							.end(nextTask);
						break;
				}
			})
			.end(function(err) {
				if (config.tasks.runMode == 'pm2') pm2.disconnect();
				if (err) self.emit('err', err);
				if (this.toProcess) self.emit('info', this.processed.toString() + '/' + this.toProcess.toString() + ' tasks processed: ' + this.processNames.join(','));

				if (!this.toProcess) {
					self.emit('idle', 'Nothing to do');
				} else if (err) {
					self.emit('info', 'Task Error - ' + err);
				}

				finish();
			});
	};

	this.install = function() {
		var self = this;
		// Task runner process {{{
		var taskRunner = function() {
			setTimeout(function() {
				// self.emit('info', 'Beginning task cycle');
				self.cycle(function() {
					// self.emit('info', 'Cycle complete');
					taskRunner();
				});
			}, config.tasks.waitTime);
		};
		// }}}
		async()
			// Auto-schedule tasks {{{
			.then(function(next) {
				Tasks.create({worker: 'library-cleaner'});
				next();
			})
			// }}}
			// Restart all partially completed tasks as pending {{{
			.then(function(next) {
				Tasks.update({status: 'processing'}, {status: 'pending'}, next);
			})
			// }}}
			// Run the initial cycle {{{
			.then(function(next) {
				setTimeout(taskRunner);
				next();
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) throw new Error(err);
				self.emit('info', 'Installed');
			});
			// }}}
	};
}

util.inherits(Task, events.EventEmitter);
module.exports = new Task();
