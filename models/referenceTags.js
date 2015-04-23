var name = 'referenceTags';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	library: {type: mongoose.Schema.ObjectId, ref: 'libraries'},
	title: {type: String},
});

module.exports = mongoose.model(name, schema);
