var fs = require('fs');

app.get('/debug/error', function(req, res) {
	res.render('pages/error', {
		message: 'This is a test error',
	});
});

app.get('/debug/ensure/login', ensure.login, function(req, res) {
	res.send('If you can see this message it means you are logged in').end();
});

app.all('/debug/echo', function(req, res) {
	var out  = {
		'POST': req.body,
		'GET': req.query,
	};
	console.log('DEBUG ECHO', out);
	res.send(out);
});