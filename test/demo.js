/**
* Imports /data/endnote-1.xml (cuts to sampleSize)
* - Library named as 'Demo library DATESTAMP'
* - Refs are randomly tagged (or not at all)
*/

global.config = require('../config');
var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var expect = require('chai').expect;
var mlog = require('mocha-logger');
var moment = require('moment');
var reflib = require('reflib');
var request = require('superagent');

describe('Demo setup', function(){
	// Library specific info
	var libraryFile = __dirname + '/data/endnote-1.xml';
	var libraryFileOut = '/tmp/sra-randomized.json';
	var libraryCount = 1988, sampleSize = _.random(300,500);

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
				expect(refs).to.have.length(libraryCount);
				finish();
			});
	});

	it('should pick random references to use', function(finish) {
		refs = _.sample(refs, sampleSize);
		expect(refs).to.have.length(sampleSize);
		finish();
	});

	it('should scramble the tags', function(finish) {
		var scrambled = 0;
		refs = refs.map(function(ref) {
			ref.tags = [];
			var dice = Math.random();
			if (dice > 0.7) {
				ref.tags.push('Keep');
			} else if (dice > 0.5) {
				ref.tags.push('Followup');
			} else if (dice > 0.3) {
				ref.tags.push('Reject');
			}
			scrambled++;
			return ref;
		});
		expect(scrambled).to.equal(sampleSize);
		finish();
	});

	it('should prepare a JSON output file', function(finish) {
		this.timeout(60 * 1000);
		mlog.log('Saving JSON file to', libraryFileOut);
		reflib.outputFile(libraryFileOut, refs)
			.on('error', finish)
			.on('finish', finish);
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
			.field('libraryTitle', 'Demo library - ' + moment().format('D/MM/YYYY HH:mm'))
			.field('json', 'true')
			.attach('file', libraryFileOut)
			.end(function(err, res) {
				if (err) return finish(err);
				library = res.body;
				expect(err).to.be.not.ok;
				expect(library).to.have.property('_id');
				expect(library).to.have.property('title');
				expect(library).to.have.property('url');
				mlog.log('Library available at', library.url);
				finish();
			});
	});
});
