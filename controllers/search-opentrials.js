var opentrials = require('opentrials');

/**
* Search OpenTrials
* @param {string} req.query.q Search query
* @return {array} Search results
*/
app.get('/api/search/opentrials', function(req, res) {
	opentrials.search(req.query.q, {pageLimit: 30}, function(err, items) {
		if (err) return res.status(400).send(err);
		res.send(items.map(function(item) {
			return {
				id: item.id,
				title: item.publicTitle,
				recordCount: item.records.length,
				status: item.status,
			};
		}));
	});
});
