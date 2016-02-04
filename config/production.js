var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	url: 'http://beta.crebp-sra.com',
	gulp: {
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: false,
	},
};
