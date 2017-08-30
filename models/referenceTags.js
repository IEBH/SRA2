var goldenColors = require('golden-colors');
var monoxide = require('monoxide');

module.exports = monoxide
	.schema('referenceTags', {
		created: {type: 'date', default: Date.now},
		library: {type: 'pointer', ref: 'libraries', indexed: true},
		title: {type: 'string', default: 'New Tag'},
		color: {type: 'string'},
		status: {type: 'string', enum: ['active', 'deleted'], default: 'active', indexed: true},
	})
	.hook('save', function(next) {
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
