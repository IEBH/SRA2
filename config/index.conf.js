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
	name: 'crebp-sra', // NPM compatible name
	title: 'CREBP-SRA',
	env: env,
	root: path.normalize(__dirname + '/..'),
	host: null, // Listen to all host requests
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	secret: "dT2CsWwmEBPnggihyKlY3IXONBIY4Db/yt5y1qcRHXkylDxHfEPGAsPkG1ikpFMgPnE9TrghA4hXSmuf8DvrdwtXZHY4Zmg8VVFs9Ei2NRK3N",
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [{user: 'user', pass: 'qwaszx'}],
	},
	analytics: {
		enabled: false,
		insert: '',
	},
	contactEmail: 'matt_carter@bond.edu.au',
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
		from: 'noreply@crebp-sra.com',
		to: 'ddeliver@bond.edu.au',
		cc: [],
		signoff: 'The CREBP-SRA Team',
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
	paths: {
		root: path.normalize(__dirname + '/..'),
	},
	limits: {
		references: 100, // How many references to hold in memory at once during operations
		recentLibraries: 10,
	},
	library: {
		request: {
			timeout: 30 * 1000,
			maxReferences: 100, // Set to 0 to disable
		},
		exlibrisSettings: {
			exlibris: {
				apiKey: 'l7xxa3ca85418b3f4010b3adf4c379a1f939', // Bond sandbox
			},
			debug: {
				execRequest: false, // FIXME: Disabled for now
				titleMangle: title => `[SRA TEST ${(new Date).toISOString()} - DO NOT ACCEPT] ${title}`,
			},
			request: {
				source: 'SRA',
				note: 'SRA',
			},
			validator: (ref, eref) => {
				if (!ref.type) return 'No reference type specified';
				if (ref.type == 'book') {
					if (!ref.title) return 'Missing book title';
					if (!ref.journal) return 'Missing journal';
					eref.pickup_location = 'MAIN',
					eref.format = 'PHYSICAL';
					eref.citation_type = 'BK';
				} else if (ref.type == 'bookSection') {
					if (!ref.title) return 'Missing book title';
					if (!ref.pages || !ref.section) return 'Missing book section or pages';
					eref.format = 'DIGITAL';
					eref.citation_type = 'BK';
				} else if (ref.type == 'conferencePaper') {
					if (!ref.title) return 'Missing conference paper title';
					eref.format = 'DIGITAL';
					eref.citation_type = 'BK';
				} else { // Assume everything else is a digital item
					if (!ref.title) return 'Missing title';
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
	tasks: {
		enabled: true,
		queryLimit: 10, // How many tasks to work on in one task cycle
		waitTime: 5 * 1000,

		// How to execute tasks
		// 'pm2' - run as seperated process via PM2
		// 'inline' - run within this thread
		runMode: 'pm2',

		'library-cleaner': {
			enabled: true,
		},
	},
	test: {
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
