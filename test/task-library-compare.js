global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var request = require('superagent');

describe('Task: library-compare', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-2.xml';
	var libraryCount = 5;

	var refs = [];
	var agent = request.agent();

	// Upload library for comparison {{{
	it('should read the original EndNote file', function(finish) {
		this.timeout(30 * 1000);
		reflib.parseFile(libraryFile)
			.on('error', finish)
			.on('ref', function(ref) {
				refs.push(ref);
			})
			.on('end', function(count) {
				expect(count).to.equal(libraryCount);
				finish();
			});
	});

	it('should login', function(finish) {
		agent.post(config.url + '/api/users/login')
			.send({username: 'mc', password: 'qwaszx'})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.have.property('_id');
				expect(res.body).to.have.property('username');
				finish();
			});
	});

	var library;
	it('should upload a test library', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/libraries/import')
			.field('libraryTitle', 'TEST: library-compare (1)')
			.field('libraryExpires', '3 hours')
			.field('json', 'true')
			.attach('file', libraryFile)
			.end(function(err, res) {
				if (err) return finish(err);
				library = res.body;
				expect(err).to.be.not.ok;
				expect(library).to.have.property('_id');
				expect(library).to.have.property('title');
				expect(library).to.have.property('url');
				finish();
			});
	});

	it('should provide the original reference library', function(finish) {
		this.timeout(60 * 1000);
		agent.get(config.url + '/api/references')
			.query({library: library._id})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(libraryCount);
				refs = res.body;
				finish();
			});
	});
	// }}}

	// Copy original library to library2 {{{
	var task2;
	it('should queue up original the library for copy', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/library-copy')
			.send({settings: {debug: true, library: {title: 'TEST: library-compare (2)'}}})
			.end(function(err, res) {
				if (err) return finish(err);
				task2 = res.body;
				expect(err).to.be.not.ok;
				expect(task2).to.have.property('_id');
				finish();
			});
	});

	it('should keep checking until the copy task is complete', function(finish) {
		var pollInterval = 3 * 1000;
		this.timeout(5 * 60 * 1000);
		var checkTask = function() {
			agent.get(config.url + '/api/tasks/' + task2._id)
				.end(function(err, res) {
					if (err) {
						checkTaskComplete(err, res);
					} else {
						var progress = res.body.progress;
						mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (progress.current ? (' ' + progress.current + ' / ' + progress.max + ' ~ ' + Math.ceil(progress.current / progress.max * 100).toString() + '%') : ''));
						if (res.body.status == 'completed') {
							checkTaskComplete(err, res);
						} else {
							setTimeout(checkTask, pollInterval);
						}
					}
				});
		};
		setTimeout(checkTask, pollInterval);

		var checkTaskComplete = function(err, res) {
			expect(err).to.be.not.ok;
			expect(res.body).to.have.property('_id');
			expect(res.body).to.have.property('status', 'completed');
			task2 = res.body;
			finish();
		};
	});

	var refs2;
	it('should provide the copied reference library', function(finish) {
		this.timeout(60 * 1000);
		agent.get(config.url + '/api/references')
			.query({library: task2.result._id})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(libraryCount);
				refs2 = res.body;
				finish();
			});
	});
	// }}}

	// Set tags on library2 {{{
	var taskSetter;
	it('should queue up reference setter for the library copy', function(finish) {
		var mask = {title: 'Fake Title', authors: ['Fred Foo', 'Barry Bar', 'Brendan Baz']};
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + task2.result._id + '/setter')
			.send({settings: mask})
			.end(function(err, res) {
				if (err) return finish(err);
				taskSetter = res.body;
				expect(err).to.be.not.ok;
				expect(taskSetter).to.have.property('_id');
				finish();
			});
	});

	it('should keep checking until the setter task is complete', function(finish) {
		var pollInterval = 3 * 1000;
		this.timeout(5 * 60 * 1000);
		var checkTask = function() {
			agent.get(config.url + '/api/tasks/' + taskSetter._id)
				.end(function(err, res) {
					if (err) {
						checkTaskComplete(err, res);
					} else {
						var progress = res.body.progress;
						mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (progress.current ? (' ' + progress.current + ' / ' + progress.max + ' ~ ' + Math.ceil(progress.current / progress.max * 100).toString() + '%') : ''));
						if (res.body.status == 'completed') {
							checkTaskComplete(err, res);
						} else {
							setTimeout(checkTask, pollInterval);
						}
					}
				});
		};
		setTimeout(checkTask, pollInterval);

		var checkTaskComplete = function(err, res) {
			expect(err).to.be.not.ok;
			expect(res.body).to.have.property('_id');
			expect(res.body).to.have.property('status', 'completed');
			taskSetter = res.body;
			finish();
		};
	});
	// }}}

	var task;
	it('should queue up the comparison task', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/library-compare')
			.send({settings: {debug: true, libraries: [task2.result._id]}})
			.end(function(err, res) {
				if (err) return finish(err);
				task = res.body;
				expect(err).to.be.not.ok;
				expect(task).to.have.property('_id');
				finish();
			});
	});

	it('should keep checking until the comparison task is complete', function(finish) {
		var pollInterval = 3 * 1000;
		this.timeout(5 * 60 * 1000);
		var checkTask = function() {
			agent.get(config.url + '/api/tasks/' + task._id)
				.end(function(err, res) {
					if (err) {
						checkTaskComplete(err, res);
					} else {
						var progress = res.body.progress;
						mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (progress.current ? (' ' + progress.current + ' / ' + progress.max + ' ~ ' + Math.ceil(progress.current / progress.max * 100).toString() + '%') : ''));
						if (res.body.status == 'completed') {
							checkTaskComplete(err, res);
						} else {
							setTimeout(checkTask, pollInterval);
						}
					}
				});
		};
		setTimeout(checkTask, pollInterval);

		var checkTaskComplete = function(err, res) {
			expect(err).to.be.not.ok;
			expect(res.body).to.have.property('_id');
			expect(res.body).to.have.property('status', 'completed');
			task = res.body;
			mlog.log('Comparison URL:', task.destination);
			console.log('RESULT', require('util').inspect(task, {depth: null, color: true}));
			finish();
		};
	});
});
