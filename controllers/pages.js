app.get('/', function(req, res) {
	if (req.user) {
		res.render('pages/main', {
			analytics: {
				insert: config.analytics.enabled ? config.analytics.insert : '',
			},
		});
	} else {
		res.render('pages/landing', {
			layout: 'layouts/landing',
			analytics: {
				insert: config.analytics.enabled ? config.analytics.insert : '',
			},
		});
	}
});
