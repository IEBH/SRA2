var colors = require('colors');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	gulp: {
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: true,
	},
};
