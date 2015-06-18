global.config = require('../config');
var async = require('async-chainable');
var expect = require('chai').expect;
var fs = require('fs');
var request = require('superagent');

describe('DeDupe - test #1', function(){
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
			.field('libraryTitle', 'dedupe-test')
			.field('json', 'true')
			.attach('file', __dirname + '/data/dedupe-1.xml')
			.end(function(err, res) {
				library = res.body;
				expect(err).to.be.not.ok;
				expect(library).to.have.property('_id');
				expect(library).to.have.property('title');
				finish();
			});
	});
});
