global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var request = require('superagent');

describe('Task: Setter', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-1.xml';
	var libraryCount = 1988;
	var dumps = {original: '/tmp/sra-original.json', postProcess: '/tmp/sra-final.json'};

	var agent = request.agent();
	var refs = []; // Collection of original refs extracted from source file
	var refsPost = [];

	var mask = { // The mask to set all matching references to
		label: 'hello',
		notes: 'world',
	};

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
			.field('libraryTitle', 'dedupe-test')
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
	it('should reset status fields', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/setter')
			.send({settings: mask})
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

	it('should provide the completed reference library', function(finish) {
		this.timeout(60 * 1000);
		agent.get(config.url + '/api/references')
			.query({
				library: library._id,
				select: '-_id,-created,-edited,-library,-status,-tags,-duplicateData',
			})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(libraryCount);
				refsPost = res.body;
				finish();
			});
	});

	it('should have applied the mask to all references', function(finish) {
		this.timeout(30 * 1000);
		var applied = 0;
		refsPost.forEach(function(ref) {
			_.forEach(mask, function(v, k) {
				if (ref[k] == mask[k]) applied++;
			});
		});
		expect(applied).to.be.equal(refsPost.length * Object.keys(mask).length);
		finish();
	});

	it('should dump the sorted libraries', function(finish) {
		async()
			.parallel([
				function(next) {
					mlog.log('Dumping original library into ' + dumps.original);

					var collection = _(refs)
						.sortByAll(['isbn', 'title'])
						.map(function(i) {
							return _.keyArrange(i);
						})
						.value();

					fs.writeFile(dumps.original, JSON.stringify(collection, null, '\t'), next);
				},
				function(next) {
					mlog.log('Dumping post-processed library into ' + dumps.postProcess);

					var collection = _(refsPost)
						.sortByAll(['isbn', 'title'])
						.map(function(i) {
							return _.keyArrange(i);
						})
						.value();

					fs.writeFile(dumps.postProcess, JSON.stringify(collection, null, '\t'), next);
				}
			])
			.then(function(next) {
				mlog.log('Compare with: vimdiff \'' + dumps.original + '\' \'' + dumps.postProcess + '\'');
				next();
			})
			.end(finish);
	});

});
