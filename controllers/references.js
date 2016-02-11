var References = require('../models/references');

restify.serve(app, References, {
	preRead: function(req, res, next) {
		if (req.method.toUpperCase() == 'GET') {
			if (req.params.id || req.query.id) return next(); // Read a specific ID - allowed
			if (req.query.library) return next(); // Requesting from a specific library - allowed
			// If we got here the requester is probably trying to spy on another library
			return res.send('Either ID or library is required to query references').status(403).end();
		} else {
			return next();
		}
	},
});
