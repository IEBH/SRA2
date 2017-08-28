/**
* Simple script to show a 'site offline' banner
*/

var express = require('express');

var app = express();
global.config = require('./config');

app.use('/', (req, res) => res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>${config.title}</title>
	<meta http-equiv="Content-Language" content="en"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<meta name="google" value="notranslate"/>
	<meta name="apple-mobile-web-app-capable" content="yes"/>
	<meta name="apple-mobile-web-app-status-bar-style" content="yes"/>
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui"/>
	<meta http-equiv="refresh" content="10"/>
	<style>
	html {
		font-family: sans-serif;
	}

	html, body {
		height: 100%;
	}

	.text-sm {
		font-size: 10px;
		color: #AAA;
	}
	</style>
</head>
<body>
	<div style="display:table; width:100%; height:100%">
		<div style="display:table-cell; vertical-align:middle">
			<div style="margin-left:auto; margin-right:auto; text-align:center">
				<h1>${config.title}</h1>
				<h3>Site is currently offline</h3>
				<div class="text-sm">This page will auto-refresh</div>
			</div>
		</div>
	</div>
</body>
</html>
`));

var server = app.listen(config.port, config.host, function() {
	console.log('Web interface listening at', config.url);
});
