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
};
