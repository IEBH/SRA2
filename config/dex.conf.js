// MC's development rig
module.exports = {
	port: 80,
	url: 'http://dex',
	tasks: {
		runMode: 'inline',
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
