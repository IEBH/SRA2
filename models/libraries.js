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
		weightings: [{
			keyword: {type: String},
			weight: {type: Number}
		}],
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
