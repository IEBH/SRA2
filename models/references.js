var name = 'references';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	library: {type: mongoose.Schema.ObjectId, ref: 'libraries'},
	created: {type: Date, default: Date.now},
	edited: {type: Date, default: Date.now},
	tags: [{type: mongoose.Schema.ObjectId, ref: 'referenceTags'}],
	title: {type: String},
	authors: [{type: String}],
});

module.exports = mongoose.model(name, schema);
