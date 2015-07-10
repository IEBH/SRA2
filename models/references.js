var name = 'references';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	library: {type: mongoose.Schema.ObjectId, ref: 'libraries', indexed: true},
	created: {type: Date, default: Date.now},
	edited: {type: Date, default: Date.now},
	tags: [{type: mongoose.Schema.ObjectId, ref: 'referenceTags', indexed: true}],
	type: {type: String, default: 'report'},
	title: {type: String},
	journal: {type: String},
	authors: [{type: String}],
	date: {type: String},
	pages: {type: String},
	volume: {type: String},
	number: {type: String},
	isbn: {type: String},
	label: {type: String},
	caption: {type: String},
	address: {type: String},
	urls: [{type: String}],
	abstract: {type: String},
	notes: {type: String},
	researchNotes: {type: String},
	status: {type: String, enum: ['active', 'deleted', 'dupe'], default: 'active', indexed: true},
	fullTextURL: {type: String},
	screening: {
		hash: {type: String},
		weight: {type: Number},
	},
	parentage: { // see libraries model for a description of this structure
		parent: {type: mongoose.Schema.ObjectId, ref: 'references', index: true},
		fingerPrint: {type: String},
	},
});

module.exports = mongoose.model(name, schema);
