var name = 'libraries';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	edited: {type: Date, default: Date.now},
	owners: [{type: mongoose.Schema.ObjectId, ref: 'users'}],
	status: {type: String, enum: ['active', 'dedupe', 'deduped', 'deleted'], default: 'active', indexed: true},
	debug: {type: String, enum: ['active', 'inactive'], default: 'inactive'},
	title: {type: String},
	tags: [{
		title: {type: String}
	}],
});

module.exports = mongoose.model(name, schema);
