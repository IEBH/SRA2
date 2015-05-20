var goldenColors = require('golden-colors');

var name = 'referenceTags';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	library: {type: mongoose.Schema.ObjectId, ref: 'libraries', indexed: true},
	title: {type: String, default: 'New Tag'},
	color: {type: String},
	status: {type: String, enum: ['active', 'deleted'], default: 'active', indexed: true},
});

schema.pre('save', function(next) {
	if (!this.color) {
		switch (this.title.toLowerCase()) {
			case 'keep':
				this.color = '#BFFCB1';
				break;
			case 'followup':
				this.color = '#B1D1FC';
				break;
			case 'reject':
				this.color = '#FCB1B5';
				break;
			default:
				this.color = goldenColors.getHsvGolden(0.5, 0.95).toJSON();
		}
	}
	next();
});

module.exports = mongoose.model(name, schema);
