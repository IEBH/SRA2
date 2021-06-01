#!/bin/env node
/**
* Remove all PM2 processes older than 2 hours
*/

// Utility functions {{{
Promise.allSeries = promises =>
	promises.reduce((chain, promise) =>
		chain.then(()=>
			Promise.resolve(
				typeof promise == 'function' ? promise() : promise
			)
		)
		, Promise.resolve()
	);
// }}}

var exec = require('@momsfriendlydevco/exec');
var moment = require('moment');

var removePoint = moment().subtract(2, 'h');

exec('/usr/bin/pm2 jlist', {buffer: true, json: true})
	.then(v => {
		console.log('Scanning', v.length, 'PM2 processes');
		return v;
	})
	.then(procs => procs.filter(proc =>
		!/^sra-/.test(proc.name) // Is not the main server process
		&& proc.pm2_env.status == 'online' // Is listed as ok
		&& moment(proc.pm2_env.created_at).isBefore(removePoint) // Is older than the above point-in-time
	))
	.then(procs => Promise.allSeries(
		procs.map(proc => ()=> Promise.resolve()
			.then(()=> console.log('pm2 delete', proc.name))
			.then(()=> exec(['/usr/bin/pm2', 'delete', proc.name], {
				logStderr: true,
				prefixStderr: `pm2-del-${proc.name} !!>`,
			}))
		)
	))
	.catch(e => {
		console.log('Fault while cleaning', e);
		process.exit(1);
	})
