global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var sra = require('sra-api');

[
	{
		id: 'tiny',
		title: 'tiny library',
		file: __dirname + '/data/endnote-2.xml',
		refCount: 5,
	},
].forEach(function(test) {

describe('Task: library-word-freq (' + test.title + ')', function(){
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

		sra.upload(test.file, {
			libraryTitle: 'TEST: word-freq (' + test.title + ')',
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
			expect(task.result).to.have.property('referenceCount', test.refCount);
			library = {_id: task.result.library};

			finish();
		}, function(task) {
			mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (task.progress.current ? (' ' + task.progress.current + ' / ' + task.progress.max + ' ~ ' + task.progress.percent.toString() + '%') : ''));
		});
	});

	it('should queue up a library for word-frequency processing', function(finish) {
		this.timeout(60 * 1000);

		sra.taskQueue(library._id, 'library-word-freq', {
			debug: true,
			weights: {
				title: 1,
				abstract: 2,
				keywords: 3,
			},
		}, function(err, resTask) {
			expect(err).to.be.not.ok;
			expect(resTask).to.have.property('_id');
			task = resTask;
			finish();
		});
	});


	it('should wait until the library has finished processing (word-freq)', function(finish) {
		this.timeout(30 * 60 * 1000);

		sra.taskWait(task._id, function(err, resTask) {
			expect(err).to.be.not.ok;
			expect(resTask).to.have.property('_id');
			expect(resTask).to.have.property('status', 'completed');
			task = resTask;
			finish();
		}, function(task) {
			mlog.log('[' + moment().format('HH:mm:ss') + '] Task still pending' + (task.progress.current ? (' ' + task.progress.current + ' / ' + task.progress.max + ' ~ ' + task.progress.percent.toString() + '%') : ''));
		});
	});

	it('should have a task result', function() {
		this.timeout(5 * 1000);
		expect(task).to.have.property('result');
		expect(task.result).to.be.an.instanceOf(Object);
		expect(task.result.words).to.be.an.array;
		/*console.log('Top 10 results:',
			_(task.result.words)
				.sortBy('-points')
				.slice(0, 10)
				.value()
		);*/

		switch (test.id) {
			case 'tiny':
				var word = _.find(task.result.words, {word: 'cancer'});
				expect(word).to.be.an.instanceOf(Object);
				expect(word.title).to.equal(2);
				expect(word.abstract).to.equal(3);
				expect(word.keywords).to.equal(1);
				expect(word.points).to.equal((2*1) + (3*2) + (1*3)); // Check weights have also been applied

				word = _.find(task.result.words, {word: 'female'});
				expect(word).to.be.an.instanceOf(Object);
				expect(word.title).to.equal(2);
				expect(word.abstract).to.equal(1);
				expect(word.keywords).to.equal(4);
				expect(word.points).to.equal((2*1) + (1*2) + (4*3));

				word = _.find(task.result.words, {word: 'breast'});
				expect(word).to.be.an.instanceOf(Object);
				expect(word.title).to.equal(3);
				expect(word.abstract).to.equal(3);
				expect(word.keywords).to.equal(4);
				expect(word.points).to.equal((3*1) + (3*2) + (4*3));

				word = _.find(task.result.words, {word: 'histological'});
				expect(word).to.be.an.instanceOf(Object);
				expect(word.title).to.equal(1);
				expect(word.abstract).to.equal(2);
				expect(word.keywords).to.equal(0);
				expect(word.points).to.equal((1*1) + (2*2) + (0*3));
				break;

		}
	});
});

});
