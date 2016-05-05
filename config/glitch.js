// MC's development rig
module.exports = {
	port: 80,
	url: 'http://glitch',
	cron: {
		runMode: 'inline',
	},
	tasks: {
		'library-cleaner': {
			enabled: false,
		},
	},
	library: {
		request: {
			email: {
				to: 'matt.crtr@gmail.com',
			},
			maxReferences: 10,
		},
	},
};
