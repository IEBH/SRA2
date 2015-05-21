var name = 'processQueue';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	creator: {type: mongoose.Schema.ObjectId, ref: 'users'},
	touched: {type: Date, default: Date.now},
	operation: {type: String, enum: ['fulltext'], index: true},
	completed: {type: Date},
	status: {type: String, enum: ['pending', 'processing', 'completed'], default: 'pending', index: true},
	history: [{
		type: {type: String},
		created: {type: Date, default: Date.now},
		response: {type: String},
	}],
	library: {type: mongoose.Schema.ObjectId, ref: 'libraries'},
	references: [{type: mongoose.Schema.ObjectId, ref: 'references'}],
});

module.exports = mongoose.model(name, schema);
