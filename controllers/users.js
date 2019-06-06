var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');
var Libraries = require('../models/libraries');
var References = require('../models/references');
var Users = require('../models/users');
var uuid = require('uuid');

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


/**
* Send an email to a user with a password reset token
* @param {string} req.body.email The email address to generate the token for
*/
app.post('/api/users/recover', function(req, res){
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.email) return next('No email provided');
			next();
		})
		// }}}
		.then('user', function(next) {
			Users.findOne({ email: req.body.email }, function(err, user) {
				if (!user) return next(`Email ${req.body.email} does not belong to an account`)
				next(null, user);
			});
		})
		.then(function(next){
			this.user._token = uuid.v4();
			this.user.save(next);
		})
		.then(function(next){
			email()
				.to(this.user.email)
				.subject("SR-Accelerator Password Reset")
				.template(__dirname + '/../views/email/password-reset.txt')
				.templateParams({
					url: config.publicUrl + '/#/reset/' + this.user._token,
				})
				.send(next)
		})
		.end(function(err){
			if (err) {
				res.send({error: err.toString()});
			} else {
				res.send({message: 'An email has been sent with instructions to reset your password'});
			}
		});
})


/**
* Accept a password change token and a new password
* @param {string} req.body.token The token to process
* @param {string} req.body.password The new password to accept
*/
app.post('/api/users/reset', function(req, res){
	async()
		.then(function(next){
			if(!req.body.token) next('Token not specified');
			if(!req.body.password) next('Password not specified');
			next()
		})
		.then('user', function(next){
			Users.findOne({_token: req.body.token}, next)
		})
		.then(function(next) {
			if (!this.user) return next('Password reset token invalid');
			if (this.user._token != req.body.token) return next('Token Mismatch');
			this.user.password = req.body.password;
			this.user._token = undefined;
			this.user.save(next);
		})
		.end(function(err){
			if (err) return res.send({error: err.toString()});
			res.send({message:'Your password has been reset'})
		})
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
		// Sanity checks {{{
		.then(function(next) {
			if (!req.user) return next('User is not logged in');
			if (!req.body || !_.isObject(req.body)) return next('Nothing to save');
			next();
		})
		// }}}
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
				} else {
					console.log(colors.red('Failed login for'), colors.cyan(req.body.username));
					return next('Unauthorized');
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
