global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var sra = require('sra-api');

describe('Task: DeDupe', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-1.xml';
	var libraryCount = 1988;
	var dumps = {original: '/tmp/sra-original.json', postProcess: '/tmp/sra-final.json'};

	var refs = []; // Collection of original refs extracted from source file
	var refsPost = [];

	it('should read the original EndNote file', function(finish) {
		this.timeout(30 * 1000);

		reflib.parseFile(libraryFile)
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
		sra.login(config.test.username, config.test.password, function(err, user) {
			expect(err).to.be.not.ok;
			expect(user).to.have.property('_id');
			expect(user).to.have.property('username');
			finish();
		});
	});

	var task;
	it('should upload a test library', function(finish) {
		this.timeout(60 * 1000);

		sra.upload(libraryFile, {
			libraryTitle: 'TEST: dedupe',
			libraryExpires: '3 hours',
		}, function(err, resTask) {
			expect(err).to.be.not.ok;
			expect(resTask).to.have.property('_id');
			task = resTask;
			finish();
		});
	});

	var library;
	it('should wait until the library has finished processing (upload)', function(finish) {
		this.timeout(60 * 1000);

		sra.taskWait(task._id, function(err, task) {
			expect(err).to.be.not.ok;
			expect(task).to.have.property('_id');
			expect(task).to.have.property('status', 'completed');
			expect(task).to.have.property('result');
			expect(task.result).to.have.property('library');
			expect(task.result).to.have.property('referenceCount', libraryCount);
			library = {_id: task.result.library};

			finish();
		}, function(task) {
			mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (task.progress.current ? (' ' + task.progress.current + ' / ' + task.progress.max + ' ~ ' + task.progress.percent.toString() + '%') : ''));
		});
	});

	it('should queue up a library for dedupe processing', function(finish) {
		this.timeout(60 * 1000);

		sra.taskQueue(library._id, 'dedupe', {debug: true}, function(err, resTask) {
			expect(err).to.be.not.ok;
			expect(resTask).to.have.property('_id');
			task = resTask;
			finish();
		});
	});

	it('should wait until the library has finished processing (dedupe)', function(finish) {
		this.timeout(30 * 60 * 1000);

		sra.taskWait(task._id, function(err, task) {
			expect(err).to.be.not.ok;
			expect(task).to.have.property('_id');
			expect(task).to.have.property('status', 'completed');
			finish();
		}, function(task) {
			mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (task.progress.current ? (' ' + task.progress.current + ' / ' + task.progress.max + ' ~ ' + task.progress.percent.toString() + '%') : ''));
		});
	});

	var refsPost;
	it('should provide the completed reference library', function(finish) {
		this.timeout(60 * 1000);

		sra.getLibraryReferences(library, {
			select: '-_id,-created,-edited,-library,-tags,-duplicateData'
		}, function(err, refs) {
			expect(err).to.be.not.ok;
			expect(refs).to.be.an('array');
			expect(refs).to.have.length(libraryCount);
			refsPost = refs;
			finish();
		});
	});

	it('should dump the sorted libraries', function(finish) {
		this.timeout(30 * 1000);

		async()
			.parallel([
				function(next) {
					mlog.log('Dumping original library into ' + dumps.original);

					var collection = _(refs)
						.sortBy(['isbn', 'title'])
						.map(function(i) {
							i.status = 'active'; // Force the status to exist so we can compare against it later
							return _.omit(_.keyArrange(i), 'recNumber');
						})
						.value();

					fs.writeFile(dumps.original, JSON.stringify(collection, null, '\t'), next);
				},
				function(next) {
					mlog.log('Dumping post-processed library into ' + dumps.postProcess);

					var collection = _(refsPost)
						.sortBy(['isbn', 'title'])
						.map(function(i) {
							return _.omit(_.keyArrange(i), '_v');
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
