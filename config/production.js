var colors = require('colors');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	url: 'http://beta.crebp-sra.com.au',
	gulp: {
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: true,
	},
};
