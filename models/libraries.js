var monoxide = require('monoxide');

module.exports = monoxide
	.schema('libraries', {
		created: {type: 'date', default: Date.now},
		viewed: {type: 'date', default: Date.now},
		edited: {type: 'date', default: Date.now},
		expiry: {type: 'date'},
		owners: [{type: 'pointer', ref: 'users', indexed: true}],
		status: {type: 'string', enum: ['active', 'deleted'], default: 'active', indexed: true},
		dedupeStatus: {type: 'string', enum: ['none', 'processing', 'review'], default: 'none'},
		debug: {type: 'string', enum: ['active', 'inactive'], default: 'inactive'},
		title: {type: 'string'},
		files: [{
			name: {type: 'string'},
			size: {type: 'number'},
			url: {type: 'string'}
		}],
		screening: {
			lastWeighting: {
				date: {type: 'date', default: Date.now},
				hash: {type: 'string'},
			},
			weightings: [{
				keyword: {type: 'string'},
				weight: {type: 'number'}
			}],
		},
		parentage: {
			parent: {type: 'pointer', ref: 'libraries', index: true}, // Original parent, if any
			fingerPrint: {type: 'string'}, // Identifying string, used when cloning to identify all original references from the same source
		},
	})
	.virtual('url', function() {
		return config.url + '/#/libraries/' + this._id ;
	});
