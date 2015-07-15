global.config = require('../config');
var async = require('async-chainable');
var colors = require('colors');
var expect = require('chai').expect;
var fs = require('fs');
var moment = require('moment');
var request = require('superagent');

describe('Task: dummy-library', function(){
	var agent = request.agent();

	it('should login', function(finish) {
		agent.post(config.url + '/api/users/login')
			.send({username: 'mc', password: 'qwaszx'})
			.end(function(err, res) {
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
			.field('libraryTitle', 'TEST: dummy-library')
			.field('libraryExpires', '3 hours')
			.field('json', 'true')
			.attach('file', __dirname + '/data/endnote-1.xml')
			.end(function(err, res) {
				library = res.body;
				expect(err).to.be.not.ok;
				expect(library).to.have.property('_id');
				expect(library).to.have.property('title');
				finish();
			});
	});

	var task;
	it('should queue up a library for dedupe processing', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/dummy-library')
			.send({settings: {debug: true}})
			.end(function(err, res) {
				task = res.body;
				expect(err).to.be.not.ok;
				expect(task).to.have.property('_id');
				finish();
			});
	});

	it('should keep checking until the task is complete', function(finish) {
		var pollInterval = 1 * 1000;
		this.timeout(5 * 60 * 1000);
		var checkTask = function() {
			agent.get(config.url + '/api/tasks/' + task._id)
				.end(function(err, res) {
					if (err || res.body.status == 'completed') {
						checkTaskComplete(err, res);
					} else {
						var progress = res.body.progress;
						console.log(colors.grey('    - [' + moment().format('HH:mm:ss') + '] Task still pending' + (progress.current ? (' ' + progress.current + ' / ' + progress.max + ' ~ ' + Math.ceil(progress.current / progress.max * 100).toString() + '%') : '')));
						setTimeout(checkTask, pollInterval);
					}
				});
		};
		checkTask();

		var checkTaskComplete = function(err, res) {
			expect(err).to.be.not.ok;
			expect(res.body).to.have.property('_id');
			expect(res.body).to.have.property('status', 'completed');
			finish();
		};
	});
});
