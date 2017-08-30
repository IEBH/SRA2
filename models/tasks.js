var monoxide = require('monoxide');

module.exports = monoxide.schema('tasks', {
	created: {type: 'date', default: Date.now},
	creator: {type: 'pointer', ref: 'users'},
	touched: {type: 'date', default: Date.now},
	worker: {type: 'string', index: true},
	completed: {type: 'date'},
	destination: {type: 'string'},
	status: {type: 'string', enum: ['pending', 'processing', 'error', 'completed'], default: 'pending', index: true},
	progress: {
		current: {type: 'number', default: 0},
		max: {type: 'number'},
	},
	history: [{
		type: {type: 'string'}, // queued, completed, error, status, response
		created: {type: 'date', default: Date.now},
		response: {type: 'string'},
	}],
	library: {type: 'pointer', ref: 'libraries'},
	references: [{type: 'pointer', ref: 'references'}],
	settings: {type: 'any'},
	result: {type: 'any'},
});
