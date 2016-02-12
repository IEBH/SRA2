global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var request = require('superagent');

// Task skipped as it sends an email to people who are likely to be upset - MC 2015-07-15
describe.skip('Task: (Journal) Request', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-2.xml';
	var libraryCount = 5;

	var agent = request.agent();
	var refs = []; // Collection of original refs extracted from source file
	var refsPost = [];

	it('should read the original EndNote file', function(finish) {
		this.timeout(30 * 1000);
		reflib.parse('endnotexml', fs.readFileSync(libraryFile))
			.on('error', finish)
			.on('ref', function(ref) {
				refs.push(ref);
			})
			.on('end', function(count) {
				expect(refs).to.have.length(libraryCount);
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
			.field('libraryTitle', 'TEST: request')
			.field('libraryExpires', '3 hours')
			.field('json', 'true')
			.attach('file', libraryFile)
			.end(function(err, res) {
				if (err) return finish(err);
				library = res.body;
				expect(err).to.be.not.ok;
				expect(library).to.have.property('_id');
				expect(library).to.have.property('title');
				finish();
			});
	});

	var task;
	it('should queue up a library for journal request processing', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/request')
			.send({settings: {
				debug: true,
				user: {
					title: 'Mr',
					name: 'John Smith',
					libraryNo: '12855535',
					email: 'matt_carter@bond.edu.au',
					faculty: 'HSM',
					position: {
						postgrad: true,
						undergrad: false,
						phd: true,
						staff: true,
					},
				},
			}})
			.end(function(err, res) {
				if (err) return finish(err);
				task = res.body;
				expect(err).to.be.not.ok;
				expect(task).to.have.property('_id');
				finish();
			});
	});

	it('should keep checking until the task is complete', function(finish) {
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
			finish();
		};
	});
});
