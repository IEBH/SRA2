/**
* Connect to the main storage database
* Requires that config/index.js has already been loaded into global.config
*/
var colors = require('colors');
var monoxide = require('monoxide');

console.log('Connecting to Mongo', config.mongo.uri);
monoxide.connect(config.mongo.uri)
	.on('error', function(err) {
		console.log(colors.red('DB CONNECTION', err));
	});
