var name = 'libraries';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	edited: {type: Date, default: Date.now},
	expiry: {type: Date},
	owners: [{type: mongoose.Schema.ObjectId, ref: 'users', indexed: true}],
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
		parent: {type: mongoose.Schema.ObjectId, ref: 'libraries', index: true}, // Original parent, if any
		fingerPrint: {type: String}, // Identifying string, used when cloning to identify all original references from the same source
	},
}, {
	toJSON: {virtuals: true},
	toObject: {virtuals: true},
});

schema.virtual('url')
	.get(function() {
		return config.url + '/#/libraries/' + this._id ;
	});

module.exports = mongoose.model(name, schema);
