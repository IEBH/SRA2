app.get('/', function(req, res) {
	if (req.user) {
		res.render('pages/main');
	} else {
		res.render('pages/landing', {
			layout: 'layouts/landing',
		});
	}
});
