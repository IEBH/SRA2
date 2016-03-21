var monoxide = require('monoxide');

module.exports = monoxide
	.schema('libraries', {
		created: {type: Date, default: Date.now},
		edited: {type: Date, default: Date.now},
		expiry: {type: Date},
		owners: [{type: 'pointer', ref: 'users', indexed: true}],
		status: {type: String, enum: ['active', 'deleted'], default: 'active', indexed: true},
		dedupeStatus: {type: String, enum: ['none', 'processing', 'review'], default: 'none'},
		debug: {type: String, enum: ['active', 'inactive'], default: 'inactive'},
		title: {type: String},
		files: [{
			name: {type: String},
			size: {type: Number},
			url: {type: String}
		}],
		screening: {
			lastWeighting: {
				date: {type: Date, default: Date.now},
				hash: {type: String},
			},
			weightings: [{
				keyword: {type: String},
				weight: {type: Number}
			}],
		},
		parentage: {
			parent: {type: 'pointer', ref: 'libraries', index: true}, // Original parent, if any
			fingerPrint: {type: String}, // Identifying string, used when cloning to identify all original references from the same source
		},
	})
	.virtual('url', function() {
		return config.url + '/#/libraries/' + this._id ;
	});
