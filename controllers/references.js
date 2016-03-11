var monoxide = require('monoxide');

app.use('/api/references/:id?', monoxide.express.middleware('references', {
	save: true,
	delete: true,

	restrict: function(req, res, next) {
		// FIXME: Test to ensure the user owns the library that this reference belongs to
		next();
	},
	restrictQuery: function(req, res, next) {
		if (!req.query.library) return res.send('Either a specific reference ID OR the library ID must be specified').status(403).end();
		next();
	},
}));
