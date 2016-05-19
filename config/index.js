var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var url = require('url');

// Determine 'ENV' {{{
var env = 'dev';
if (process.env.VCAP_SERVICES) {
	env = 'appfog';
} else if (process.env.OPENSHIFT_NODEJS_IP) {
	env = 'openshift';
} else if (process.env.MONGOLAB_URI) {
	env = 'heroku';
} else if (/-e\s*([a-z0-9\-]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

var defaults = {
	name: 'crebp-sra', // NPM compatible name
	title: 'CREBP-SRA',
	env: env,
	root: path.normalize(__dirname + '/..'),
	host: null, // Listen to all host requests
	port: process.env.PORT || 80,
	url: 'http://localhost',
	secret: "dT2CsWwmEBPnggihyKlY3IXONBIY4Db/yt5y1qcRHXkylDxHfEPGAsPkG1ikpFMgPnE9TrghA4hXSmuf8DvrdwtXZHY4Zmg8VVFs9Ei2NRK3N",
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [{user: 'user', pass: 'qwaszx'}],
	},
	contactEmail: 'matt_carter@bond.edu.au',
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	mailgun: {
		apiKey: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		domain: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
	},
	mongo: {
		uri: 'mongodb://localhost/sra',
		options: {
			db: {
				safe: true
			}
		}
	},
	newrelic: {
		enabled: false,
		name: 'CREBP-SRA',
		license: 'c71e85e2d852cb4962d8b47dcad90de117501a07',
	},
	limits: {
		references: 100, // How many references to hold in memory at once during operations such as export, dedupe etc.
		recentLibraries: 10,
	},
	library: {
		request: {
			method: 'sendmail', // sendmail, mailgun
			email: {
				from: null, // Set to falsy to use users own email
				to: 'ddeliver@bond.edu.au',
				cc: [],
			},
			timeout: 30 * 1000,
			maxReferences: 100, // Set to 0 to disable
		},
	},
	cron: {
		enabled: true,
		queryLimit: 10, // How many tasks to work on in one cron cycle
		waitTime: 3 * 1000,

		// How to execute tasks
		// 'pm2' - run as seperated process via PM2
		// 'inline' - run within this thread
		runMode: 'pm2',
	},
	search: {
		pubmed: {
			timeout: 20 * 1000,
			resultsLimit: 50, // How many result ID's to ask for per search query
			idLimit: 10, // How many paper ID's to fetch at once per search query
		},
	},
	tasks: {
		'library-cleaner': {
			enabled: true,
		},
		dedupe: {
			limit: 20, // How many comparison threads to allow at once for the dedupe task
			stringDistance: {
				// String distance between titles before its considered a match
				// The following tests are performed in series - the idea being the least CPU costly are up first
				jaroWinklerMin: 0.9, // natural.JaroWinklerDistance 
				levenshteinMax: 10, // natural.LevenshteinDistance 
			},
		},
	},
};


var config = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overriden by private.js if its present
	fs.existsSync(__dirname + '/private.js') ? require(__dirname + '/private.js') : {},

	// Whish are overriden by the NODE_ENV.js file if its present
	fs.existsSync(__dirname + '/' + defaults.env + '.js') ? require(__dirname + '/' + defaults.env + '.js') : {}
);

// Sanity checks {{{
// If config.url doesn't contain a port append it {{{
if (config.port != 80 && url.parse(config.url).port != config.port) {
	var parsedURL = url.parse(config.url);
	parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
	parsedURL.port = config.port;
	config.url = url.format(parsedURL);
}
// }}}
// Trim remaining '/' from url {{{
config.url = _.trimEnd(config.url, '/');
// }}}
// }}}

module.exports = config;
