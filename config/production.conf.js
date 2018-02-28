var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	url: 'http://crebp-sra.com',
	port: 80,
	gulp: {
		notifications: false,
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: false,
	},
	newrelic: {
		enabled: true,
	},
	request: {
		fallbackEmail: { // Send an email to the below if the exlibris request fails
			enabled: true,
			to: 'matt_carter@bond.edu.au',
			subject: ref => `SRA Journal Request failed - ${ref.title}`,
		},
		exlibrisSettings: {
			enabled: true,
			debug: {
				execRequest: true,
			},
		},
	},
};
