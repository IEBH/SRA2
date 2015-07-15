// MC's development rig
module.exports = {
	port: 80,
	url: 'http://local',
	newrelic: {
		enabled: false,
	},
	tasks: {
		'library-cleaner': {
			enabled: false,
		},
	},
};
