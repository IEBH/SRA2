var reflib = require('reflib');

/**
* Provide a JSON array of all known MeSH headings
*/
app.get('/api/assets/mesh', function(req, res) {
	res.sendFile('mesh-headings.json', {root: 'data'});
});

app.get('/api/assets/refTypes', function(req, res) {
	res.send(reflib.refTypes).end();
});
