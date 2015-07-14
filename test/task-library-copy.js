global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var request = require('superagent');

describe('Task: library-copy', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-1.xml';
	var libraryCount = 1988;
	var dumps = {original: '/tmp/sra-original.json', postProcess: '/tmp/sra-final.json'};

	var agent = request.agent();
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
			.field('libraryTitle', 'TEST: library-copy (1)')
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

	var task;
	it('should queue up a library for copy', function(finish) {
		this.timeout(60 * 1000);
		agent.post(config.url + '/api/tasks/library/' + library._id + '/library-copy')
			.send({settings: {debug: true, library: {title: 'TEST: library-copy (2)'}}})
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
			task = res.body;
			finish();
		};
	});

	it('should have copied the library', function(finish) {
		expect(task.result._id).to.be.ok;
		expect(library.url).to.not.equal(task.result.url);
		mlog.log('Original library available at ', library.url);
		mlog.log('Duplicate library available at', task.result.url);
		finish();
	});

	var oldLibraryRefs;
	it('should provide the old reference library', function(finish) {
		this.timeout(60 * 1000);
		agent.get(config.url + '/api/references')
			.query({library: library._id})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(libraryCount);
				oldLibraryRefs = res.body;
				finish();
			});
	});

	var newLibraryRefs;
	it('should provide the copied reference library', function(finish) {
		this.timeout(60 * 1000);
		agent.get(config.url + '/api/references')
			.query({library: task.result._id})
			.end(function(err, res) {
				if (err) return finish(err);
				expect(err).to.be.not.ok;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(libraryCount);
				newLibraryRefs = res.body;
				finish();
			});
	});

	it('should have copied the references', function(finish) {
		this.timeout(60 * 1000);
		newLibraryRefs.forEach(function(ref) {
			// New Ref {{{
			expect(ref).to.have.deep.property('parentage.parent');
			expect(ref).to.have.deep.property('parentage.fingerPrint');
			expect(ref).to.have.property('_id');
			expect(ref).to.have.property('title');
			expect(ref).to.have.property('authors');
			expect(ref).to.have.property('tags');
			// }}}
			var oldRef = _.find(oldLibraryRefs, {_id: ref.parentage.parent});
			// Old Ref {{{
			expect(oldRef).to.be.ok;
			expect(oldRef).to.have.property('_id');
			expect(oldRef).to.have.property('title');
			expect(oldRef).to.have.property('authors');
			expect(oldRef).to.have.property('tags');
			// }}}
			// Matching {{{
			expect(ref._id).to.not.equal(oldRef._id);
			expect(ref.title).to.equal(oldRef.title);
			expect(ref.authors).to.deep.equal(oldRef.authors);
			expect(ref.tags).to.deep.equal(oldRef.tags);
			// }}}
		});
		finish();
	});
});
