var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	url: 'http://sr-accelerator.com',
	publicUrl: 'http://sr-accelerator.com',
	port: process.env.PORT || 80,
	gulp: {
		notifications: false,
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: false,
	},
	request: {
		fallbackEmail: { // Send an email to the below if the exlibris request fails
			enabled: true,
			to: 'jclark@bond.edu.au',
			subject: ref => `SRA Journal Request failed - ${ref.title}`,
		},
		exlibrisSettings: {
			enabled: true,
			debug: {
				execRequest: true,
			},
		},
	},
	ssl: {
		enabled: false, // Managed by Nginx
	},
};
