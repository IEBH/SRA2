var monoxide = require('monoxide');

module.exports = monoxide.schema('replicants', {
	created: {type: 'date', default: Date.now},
	owner: {type: 'pointer', ref: 'users'},
	randomSeed: {type: 'number', default: 1}, // The random seed to use (regenerated on each call to /api/replicant/:id/generate?randomize=true)
	title: {type: 'string'},
	revman: {type: 'object'}, // The nested RevMan object extracted via the revman module
	grammar: {type: 'string'}, // The basename of the gammar file to use
	primary: {type: 'array'}, // Array of IDs used within the revman object that are primary studies
});
