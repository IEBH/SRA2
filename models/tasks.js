var monoxide = require('monoxide');

module.exports = monoxide.schema('tasks', {
	created: {type: Date, default: Date.now},
	creator: {type: 'pointer', ref: 'users'},
	touched: {type: Date, default: Date.now},
	worker: {type: String, index: true},
	completed: {type: Date},
	destination: {type: String},
	status: {type: String, enum: ['pending', 'processing', 'error', 'completed'], default: 'pending', index: true},
	progress: {
		current: {type: Number, default: 0},
		max: {type: Number},
	},
	history: [{
		type: {type: String}, // queued, completed, error, status, response
		created: {type: Date, default: Date.now},
		response: {type: String},
	}],
	library: {type: 'pointer', ref: 'libraries'},
	references: [{type: 'pointer', ref: 'references'}],
	settings: {type: 'any'},
	result: {type: 'any'},
});
