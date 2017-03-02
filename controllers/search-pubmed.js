var _ = require('lodash');
var async = require('async-chainable');
var request = require('superagent');

/**
* Search pubmed
* @param {string} req.query.q Search query
* @return {Object} Search results
*/
app.get('/api/search/pubmed', function(req, res) {
	async()
		.set('query', {query: req.query.q})
		.then(function(next) {
			// Sanity Checks {{{
			if (!req.query.q) return next('No query specified');
			next();
			// }}}
		})
		.then('paperIds', function(next) { // Perform search and get a list of paper ID results
			var self = this;
			request.get('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json')
				.timeout(config.search.pubmed.timeout)
				.accept('application/json')
				.query({
					retmode: 'json',
					term: req.query.q,
					retmax: config.search.pubmed.resultsLimit,
				})
				.end(function(err, res) {
					if (err) return next(err);
					if (res.statusCode != 200) return next("Failed to get search result, return code: " + res.statusCode + ' - ' + res.text);
					self.query.internalQuery = res.body.esearchresult.querytranslation;
					self.query.count = res.body.esearchresult.count;
					next(null, res.body.esearchresult.idlist);
				});
		})
		.then('papers', function(next) { // Now request the paper meta info
			request.get('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi')
				.timeout(config.search.pubmed.timeout)
				.accept('application/json')
				.query({
					db: 'pubmed',
					retmode: 'json',
					id: this.paperIds.join(','),
				})
				.end(function(err, res) {
					if (err) return next(err);
					if (res.statusCode != 200) return next("Failed to get meta info, return code: " + res.statusCode + ' - ' + res.text);

					next(null, Object.keys(res.body.result).map(function(id) {
						var ref = res.body.result[id];
						return {
							id: ref.uid,
							title: ref.title,
							journal: ref.fulljournalname,
							authors: ref.authors ? ref.authors.map(function(auth) {
								return auth.name;
							}) : [],
							lang: (ref.lang ? ref.lang[0] : 'eng'),
							date: ref.pubdate,
							volume: ref.volume,
							issue: ref.issue,
							pages: ref.pages,
							isbn: ref.issn,
							type: ref.pubtype ? ref.pubtype[0] : 'unknown',
							has: {
								abstract: (ref.attributes && _.includes(ref.attributes, 'Has Abstract')),
							},
						};
					}));
				});
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send({
				query: this.query,
				results: this.papers,
			});
		});
});
