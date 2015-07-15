var email = require('email').Email;

/**
* Send a contact form email
* NOTE: The desination is picked up from config.contactEmail
* @param string req.body.name The name of the sender
* @param string req.body.email The email address of the sender
* @param string req.body.subject The subject of the form (defaults to 'Contact form' if none)
* @param string req.body.body The body of the email
*/
app.post('/api/contact', function(req, res) {
	if (!req.body) return res.status(400).send('No post data provided');
	if (!req.body.name) return res.status(400).send('No name provided');
	if (!req.body.email) return res.status(400).send('No email provided');
	if (!req.body.body) return res.status(400).send('No content provided');

	new email({
		from: req.body.name + ' <' + req.body.email + '>',
		to: config.contactEmail,
		subject: req.body.subject || 'Contact form',
		body: req.body.body,
		bodyType: 'text/plain',
	}).send(function(err) {
		if (err) {
			console.log('Error emailing contact form', err);
			return res.status(400).send(err);
		}
		console.log('Contact form email dispatched for', req.body.email);
		res.status(200).end();
	});
});
