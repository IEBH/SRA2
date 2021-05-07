// Config profile for other slave instances on server that arn't production

var colors = require('chalk');
var production = require('./production.conf');

console.log(colors.bold.red('RUNNING IN PRODUCTION / SLAVE MODE'));

module.exports = {
	...production,
	tasks: {
		enabled: false,
	},
};
