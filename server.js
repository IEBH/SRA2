#!/usr/bin/env node
// Initial / Config {{{
global.config = require('./config');
// }}}
// Initial / NewRelic {{{
if (config.newrelic.enabled) require('newrelic');
// }}}
// Requires {{{
var _ = require('lodash');
var colors = require('chalk');
var bodyParser = require('body-parser');
var express = require('express');
var layouts = require('express-ejs-layouts')
var fspath = require('path');
var fs = require('fs');
var requireDir = require('require-dir');
global.app = express();
// }}}
// Settings {{{
require('./config/db');
app.set('title', config.title);
app.set('view engine', "html");
app.set('layout', 'layouts/main');
app.engine('.html', require('ejs').renderFile);
app.enable('view cache');
app.use(layouts);
// }}}
// Settings / Basic Auth lockdown {{{
// Enable this to temporarily lock down the server quickly
// app.use(express.basicAuth('user', 'letmein'));

// Lookup auth details from config.access.users
if (config.access && config.access.lockdown) {
	var basicAuth = require('basic-auth-connect');
	app.use(basicAuth(function(user, pass) {
		var user = _.find(config.access.users, {user: user});
		return (user && pass == user.pass);
	}, config.title + ' - Private'));
}
// }}}
// Settings / Parsing {{{
app.use(require('cookie-parser')());
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '150mb', extended: false}));
app.use(require('compression')());
// }}}
// Settings / Cookies + Sessions {{{
app.use(require('connect-flash')());
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
app.use(session({
	secret: config.secret,
	store: new mongoStore({mongooseConnection: mongoose.connection}),
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: new Date(Date.now() + (3600000 * 48)), // 48 hours
		maxAge: (3600000 * 48) // 48 hours
	}
}));
// }}}
// Settings / Passport {{{
global.passport = require('passport');

var passportLocalStrategy = require('passport-local').Strategy;
var Users = new require('./models/users');

passport.use(new passportLocalStrategy({
	passReqToCallback: true,
	usernameField: 'username',
}, function(req, username, password, next) {
	console.log('Check login', colors.cyan(username));
	Users.findByLogin(req, username, password, next); // Delegate to the user model
}));
passport.serializeUser(function(user, next) {
	next(null, user.username);
});
passport.deserializeUser(function(id, next) {
	Users
		.findOne({username: id})
		.exec(function(err, user) {
			return next(err, user);
		});
});

// Various security blocks
global.ensure = {
	loginFail: function(req, res, next) { // Special handler to reject login and redirect to login screen or raise error depending on context
		console.log(colors.red('DENIED'), colors.cyan(req.url));
		// Failed login - decide how to return
		res.format({
			'application/json': function() {
				res.status(401).send({err: "Not logged in"}).end();
			},
			'default': function() {
				res.redirect('/login');
			},
		});
	},

	login: function(req, res, next) {
		if (req.user && req.user._id) { // Check standard passport auth (inc. cookies)
			return next();
		} else if (req.body.token) { // Token has been provided
			Users.findOne({'auth.tokens.token': req.body.token}, function(err, user) {
				if (err || !user) return ensure.loginFail(req, res, next);
				console.log('Accepted auth token', colors.cyan(req.body.token));
				req.user = user;
				next();
			});
		} else { // Not logged in and no method being passed to handle - reject
			ensure.loginFail(req, res, next);
		}
	}
};

app.use(passport.initialize());
app.use(passport.session());
// }}}
// Settings / Restify {{{
// Add express-restify-mongoose-queryizer to fix ERM not supporting `?filter=value` format any more
app.use(require('express-restify-mongoose-queryizer')({
	rewriteQuery: true,
	rewriteQueryDeleteKeys: false,
	postToPatch: true,
	postToPatchUrl: /^\/api\/.+\/[0-9a-f]{24}$/,
}));

global.restify = require('express-restify-mongoose');
var ERMGuard = require('express-restify-mongoose-guard')({
	// Forbid any field that begins with '_'
	removeFields: [/^_/],

	// Allow _id and __v (but map to _v)
	renameFields: {_id: '_id', __v: '_v'},

	// Remap all DELETE methods to UPDATE setting status=deleted
	deleteUpdateRemap: {status: 'deleted'},
});
restify.defaults({
	version: '',
	middleware: ERMGuard.preHook,
	outputFn: ERMGuard.postHook,
});
// }}}
// Settings / Logging {{{
app.use(require('express-log-url'));
// }}}
// Controllers {{{
require('./controllers/users'); // Invoke users first as it needs to install its passport middleware
requireDir('./controllers');
// }}}

// Static pages {{{
app.use(express.static(config.root + '/public'));
app.use('/app', express.static(config.root + '/app'));
app.use('/build', express.static(config.root + '/build'));
app.use('/partials', express.static(config.root + '/views/partials'));
// }}}

// Error catcher {{{
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!').end();
});
// }}}

// Init {{{
var server = app.listen(config.port, config.host, function() {
	console.log('Web interface listening at', colors.cyan(config.url));
});
// }}}
// Init tasks {{{
if (config.tasks.enabled) {
	var tasks = require('./tasks');
	tasks
		.on('info', function(msg) {
			console.log(colors.blue('[Tasks]'), msg);
		})
		.on('err', function(msg) {
			if (msg == 'Nothing to do') return;
			console.log(colors.blue('[Tasks]'), colors.red('ERROR'), msg);
		})
		.install();
}
// }}}
