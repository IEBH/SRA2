// MC's development rig
module.exports = {
	port: 80,
	url: 'http://glitch',
	tasks: {
		runMode: 'pm2',
		'library-cleaner': {
			enabled: false,
		},
	},
	library: {
		request: {
			maxReferences: 10,
		},
	},
};
