var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var Libraries = require('../models/libraries');
var References = require('../models/references');
var Users = require('../models/users');

// Passport setup {{{
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;

// Setup local stratergy
passport.use(new passportLocalStrategy({
	passReqToCallback: true,
	usernameField: 'username',
}, function(req, username, password, next) {
	console.log(colors.blue('[LOGIN]'), 'Check login', colors.cyan(username));

	// Lookup user by username
	Users.findOne({username: username}, function(err, user) {
		if (err) return next(err);
		if (!user) {
			console.log(colors.blue('[LOGIN]'), 'Username not found', colors.cyan(username));
			return next(null, false, req.flash('passportMessage', 'Incorrect username'));
		}
		user.validPassword(password, function(err, isMatch) {
			if (err) return next(err);
			if (!isMatch) {
				console.log(colors.blue('[LOGIN]'), 'Invalid password for', colors.cyan(username));
				next(null, false, req.flash('passportMessage', 'Incorrect password'));
			} else {
				console.log(colors.blue('[LOGIN]'), 'Successful login for', colors.cyan(username));
				next(null, user);
			}
		});
	});
}));

// Tell passport what to save to lookup the user on the next cycle
passport.serializeUser(function(user, next) {
	next(null, user.username);
});

// Tell passport to to retrieve the full user we stashed in passport.serializeUser()
passport.deserializeUser(function(id, next) {
	Users
		.findOne({username: id})
		.exec(function(err, user) {
			return next(err, user);
		});
});

// Boot passport and its session handler
app.use(passport.initialize());
app.use(passport.session());
// }}}

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

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

	async()
		.parallel({
			recentLibraries: function(next) {
				Libraries.find({status: 'active'})
					.select('_id viewed title')
					.sort('-viewed -edited')
					.limit(config.limits.recentLibraries)
					.exec(next);
			},
			libraries: function(next) {
				Libraries.find({
					owners: req.user._id,
					status: 'active',
				})
					.sort('name')
					.exec(next);
			},
		})
		.parallel({
			referenceCount: function(next) {
				References.count({library: {$in: this.libraries.map(l => l._id)}}, next);
			},
			librariesSharedCount: function(next) {
				Libraries.count({
					library: {$in: this.libraries.map(l => l._id)},
					'owners.1': {$exists: true},
				}, next);
			},
		})
		.end(function(err) {
			if (err) return res.status(400).send(err.toString());

			var user = _.clone(req.user.data);
			user.settings = req.user.settings;
			user.recentLibraries = this.recentLibraries;
			user.stats = {
				libraries: this.libraries.length,
				librariesShared: this.librariesSharedCount,
				references: this.referenceCount,
			};
			res.send(user);
		});
});

app.post('/api/users/profile', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.user) return next('User is not logged in');
			if (!req.body || !_.isObject(req.body)) return next('Nothing to save');
			next();
			// }}}
		})
		.then(function(next) {
			['email', 'name', 'title', 'libraryNo', 'faculty', 'position', 'settings'].forEach(function(field) {
				if (req.body[field]) req.user[field] = req.body[field];
			});
			
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
				if (user) {
					console.log(colors.green('Successful login for'), colors.cyan(req.body.username));
					req.logIn(user, function(err) {
						if (err) return next(err);
						next();
					});
				} else {
					console.log(colors.red('Failed login for'), colors.cyan(req.body.username));
					next('Unauthorized');
				}
			})(req, res, next);
		})
		.end(function(err) {
			if (err) return res.send({error: 'Invalid username or password'});
			res.redirect('/api/users/profile');
		});
});

app.post('/api/users/logout', function(req, res) {
	req.logout();
	res.status(200).send({});
});
