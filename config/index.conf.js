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
} else if (/-e\s*([a-z0-9\-\.]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-\.]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

var defaults = {
	isProduction: false, // Master `is this production mode` switch - disables debugging and vario
	name: 'sr-accelerator', // NPM compatible name
	title: 'SR-Accelerator',
	env: env,
	root: path.normalize(__dirname + '/..'),
	host: null, // Listen to all host requests
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	publicUrl: 'http://localhost',
	secret: 'FIXME: See config/private.conf.js',
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [{user: 'user', pass: 'qwaszx'}],
	},
	analytics: {
		enabled: false,
		insert: '',
	},
	contactEmail: 'theteam@sr-accelerator.com',
	gulp: {
		notifications: true,
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	email: {
		enabled: true,
		method: 'mailgun',
		from: 'noreply@sr-accelerator.com',
		to: 'ddeliver@bond.edu.au',
		cc: [],
		signoff: 'The SR-Accelerator Team',
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
	paths: {
		root: path.normalize(__dirname + '/..'),
	},
	papertrail: {
		enabled: false,
		host: 'FIXME:Specify in private.conf.js',
		port: 'FIXME:Specify in private.conf.js',
		hostname: 'FIXME:Specify in private.conf.js',
	},
	limits: {
		references: 100, // How many references to hold in memory at once during operations
		recentLibraries: 10,
	},
	request: {
		timeout: 30 * 1000,
		maxReferences: 100, // Set to 0 to disable
		fallbackEmail: { // Send an email to the below if the exlibris request fails
			enabled: true,
			to: 'matt_carter@bond.edu.au',
			subject: ref => `SRA Journal Request failed - ${ref.title}`,
		},
		exlibrisSettings: {
			enabled: false, // Set to false to always send an email
			exlibris: {
				apiKey: 'FIXME: SEE config/private.conf.js',
				region: 'eu',
				resourceRequestRetry: 1, // How many times to retry the request if we get back a fail
			},
			debug: {
				execRequest: false,
				// titleMangle: title => `[SRA TEST ${(new Date).toISOString()} - DO NOT ACCEPT] ${title}`,
			},
			request: {
				source: 'SRA',
				note: 'SRA',
			},
			validator: (ref, eref) => {
				if (!ref.type) return 'No reference type specified';
				if (ref.type == 'book') {
					if (!eref.title) return 'Missing book title';
					eref.pickup_location = 'MAIN',
					eref.format = 'PHYSICAL';
					eref.citation_type = 'BK';
				} else if (ref.type == 'bookSection') {
					if (!eref.title) return 'Missing book title';
					if (!eref.pages && !eref.section) return 'Missing book section or pages';
					eref.format = 'DIGITAL';
					eref.citation_type = 'BK';
				} else if (ref.type == 'conferencePaper') {
					if (!eref.title) return 'Missing conference paper title';
					eref.format = 'DIGITAL';
					eref.citation_type = 'BK';
				} else { // Assume everything else is a digital item
					if (!eref.title) return 'Missing title';
					eref.format = 'DIGITAL';
					eref.citation_type = 'CR';
				}
				return true;
			},
		},
	},
	search: {
		pubmed: {
			timeout: 20 * 1000,
			resultsLimit: 50, // How many result ID's to ask for per search query
			idLimit: 10, // How many paper ID's to fetch at once per search query
		},
	},
	ssl: {
		enabled: false,
		cert: '/etc/letsencrypt/live/sr-accelerator.com/fullchain.pem',
		key: '/etc/letsencrypt/live/sr-accelerator.com/privkey.pem',
	},
	tasks: {
		enabled: true,
		queryLimit: 10, // How many tasks to work on in one task cycle
		waitTime: 5 * 1000,

		// How to execute tasks
		// 'pm2' - run as seperate process via PM2
		// 'inline' - run within this thread
		runMode: 'pm2',

		'library-cleaner': {
			enabled: true,
		},
	},
	test: { // Details to use in testkits
		username: 'mc',
		password: 'qwaszx',
	},
};


var config = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overriden by private.conf.js if its present
	fs.existsSync(__dirname + '/private.conf.js') ? require(__dirname + '/private.conf.js') : {},

	// Which are overriden by the NODE_ENV.conf.js file if its present
	fs.existsSync(__dirname + '/' + defaults.env + '.conf.js') ? require(__dirname + '/' + defaults.env + '.conf.js') : {}
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
// Calculate config.publicUrl - same as config.url with port forced to 80 {{{
var parsedURL = url.parse(config.url);
parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
parsedURL.port = undefined; // Have to set this to reset the port to default (80 doesn't work for some reason)
config.publicUrl = _.trimEnd(url.format(parsedURL), '/');
// }}}
// }}}

global.config = module.exports = config;
