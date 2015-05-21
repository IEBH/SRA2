var name = 'libraries';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	edited: {type: Date, default: Date.now},
	owners: [{type: mongoose.Schema.ObjectId, ref: 'users', indexed: true}],
	status: {type: String, enum: ['active', 'deleted'], default: 'active', indexed: true},
	dedupeStatus: {type: String, enum: ['none', 'processing', 'review'], default: 'none'},
	debug: {type: String, enum: ['active', 'inactive'], default: 'inactive'},
	title: {type: String},
});

module.exports = mongoose.model(name, schema);
