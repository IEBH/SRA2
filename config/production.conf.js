var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	url: 'http://sr-accelerator.com',
	publicUrl: 'http://sr-accelerator.com',
	port: process.env.PORT || 80,
	analytics: {
		enabled: true,
		insert: [
			'<!-- Google tag (gtag.js) -->',
			'<script async src="https://www.googletagmanager.com/gtag/js?id=G-69RXV8Y1KB"></script>',
			'<script>',
			'  window.dataLayer = window.dataLayer || [];',
			'  function gtag(){dataLayer.push(arguments);}',
			'  gtag(\'js\', new Date());',
			'',
			'  gtag(\'config\', \'G-69RXV8Y1KB\');',
			'</script>',
		].join('\n'),
	},
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
