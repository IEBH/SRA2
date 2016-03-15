var monoxide = require('monoxide');

app.use('/api/references/:id?', monoxide.express.middleware('references', {
	get: true,
	query: true,
	count: true,
	save: true,
	delete: true,

	all: function(req, res, next) {
		// FIXME: Test to ensure the user owns the library that this reference belongs to
		next();
	},
	query: function(req, res, next) {
		if (!req.query.library) return res.status(403).send('Either a specific reference ID OR the library ID must be specified').end();
		next();
	},
}));
