var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var Users = require('../models/users');

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/login', function(req, res) {
	if (req.user) // Already logged in
		return res.redirect('/');

	res.render('pages/login', {
		layout: 'layouts/promo',
		namespace: 'plain',
		message: req.flash('passportMessage'),
	});
});

app.get('/signup', function(req, res) {
	res.render('pages/signup', {
		layout: 'layouts/promo',
		namespace: 'plain',
		message: req.flash('signupMessage'),
		values: {key: '', name: '', email: '', password: ''},
	});
});

app.post('/signup', function(req, res, finish) {
	// Rather crappy checking - yes this needs improvement MC 2014-12-31

	async()
		.then(function(next) { // Form validation
			if (!req.body.name) {
				next('No name specified')
			} else if (!req.body.email) {
				next('No email specified')
			} else if (!/^(.*)@(.*)$/.test(req.body.email)) { // FIXME: Ugh!
				next('That doesnt look like a valid email address')
			} else if (!req.body.password) {
				next('No password specified')
			} else {
				next();
			}
		})
		.then(function(next) { // Check email isn't already in use
			Users.findOne({email: req.body.email}, function(err, user) {
				if (user) return next('Email already registered');
				next();
			});
		})
		.then(function(next) { // Create the user
			return Users.create({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
			}, function(err) {
				if (err) return res.status(400).send(err.err); // DB raised error
				return passport.authenticate('local', { // Log the user in
					successRedirect: '/',
					failureRedirect: '/login',
					failureFlash: true,
				})(req, res, finish);
				next(); // Finalize so we drop out of this nest of series actions
			});
		})
		.end(function(err) {
			if (err) { // There was an issue creating the account
				req.flash('signupMessage', err); // Setup the message to display

				// Re-render the signup form

				var values = {
					key: '',
					name: '',
					email: '',
					password: '',
				};
				_.assign(values, req.body);

				res.render('pages/signup', {
					layout: 'layouts/promo',
					namespace: 'plain',
					message: req.flash('signupMessage'),
					values: values,
				});
			}
		});
});

app.get('/api/users/profile', function(req, res) {
	if (!req.user) return res.status(200).send({});

	var user = _.clone(req.user.data);
	user.settings = req.user.settings;

	res.send(user);
});

app.post('/api/users/profile', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.user) return next('User is not logged in');
			if (!req.body.settings) return next('No .settings object specified');
			if (!_.isObject(req.body.settings)) return next('.settings must be an object');
			next();
			// }}}
		})
		.then(function(next) {
			req.user.settings = req.body.settings;
			req.user.save();
			next();
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.status(200).end();
		});
});

app.post('/api/users/login', function(req, res) {
	async()
		.then('profile', function(next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) return next(err);
				if (!user) {
					console.log(colors.green('Successful login for'), colors.cyan(req.body.username));
					return next('Unauthorized');
				} else {
					console.log(colors.red('Failed login for'), colors.cyan(req.body.username));
				}
				req.logIn(user, function(err) {
					if (err) return next(err);
					var output = _.clone(user.data);
					output.settings = user.settings;
					return next(null, output);
				});
			})(req, res, next);
		})
		.end(function(err) {
			if (err) return res.send({error: 'Invalid username or password'});
			res.send(this.profile);
		});
});

app.post('/api/users/logout', function(req, res) {
	req.logout();
	res.status(200).send({});
});

// FIXME: Security needed here to ensure only admins can get CRUD access
restify.serve(app, Users);
