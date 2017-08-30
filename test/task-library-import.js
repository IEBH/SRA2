global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var sra = require('sra-api');

describe('Task: library-import', function(){
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

});
