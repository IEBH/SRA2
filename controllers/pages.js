app.get('/', function(req, res) {
	res.render('pages/main', {
		analytics: {
			insert: config.analytics.enabled ? config.analytics.insert : '',
		},
	});
});
