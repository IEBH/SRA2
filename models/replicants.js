var name = 'replicants';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	owner: {type: mongoose.Schema.ObjectId, ref: 'users'},
	randomSeed: {type: Number, default: 1}, // The random seed to use (regenerated on each call to /api/replicant/:id/generate?randomize=true)
	title: {type: String},
	revman: {type: mongoose.Schema.Types.Mixed}, // The nested RevMan object extracted via the revman module
	grammar: {type: String}, // The basename of the gammar file to use
	primary: {type: Array}, // Array of IDs used within the revman object that are primary studies
}, {
	usePushEach: true,
});

module.exports = mongoose.model(name, schema);
