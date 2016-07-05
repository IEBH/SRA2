var name = 'replicants';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	owner: {type: mongoose.Schema.ObjectId, ref: 'users'},
	revman: {type: mongoose.Schema.Types.Mixed},
	grammar: {type: String},
	primary: {type: Array}, // Array of IDs used within the revman object that are primary studies
});

module.exports = mongoose.model(name, schema);
