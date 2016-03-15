var monoxide = require('monoxide');

app.use('/api/referenceTags/:id?', monoxide.express.middleware('referenceTags', {
	get: true,
	query: true,
	count: true,
	save: true,
	delete: true,

	all: function(req, res, next) {
		// FIXME: Test to ensure the user owns the library that this reference belongs to
		next();
	},
}));
