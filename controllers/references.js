var References = require('../models/references');

restify.serve(app, References, {
	preRead: function(req, res, next) {
		var q = req.query.query ? JSON.parse(req.query.query) : {};

		if (req.method.toUpperCase() == 'GET') {
			if (req.params.id || q.id) return next(); // Read a specific ID - allowed
			if (q.library) return next(); // Requesting from a specific library - allowed
			// If we got here the requester is probably trying to spy on another library
			return res.send('Either ID or library is required to query references').status(403).end();
		} else {
			return next();
		}
	},
});
