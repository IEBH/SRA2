var monoxide = require('monoxide');

var User = module.exports = monoxide.schema('user', {
	username: {type: String, required: true, index: {unique: true}},
	email: {type: String, required: true, index: {unique: true}},
	_passhash: {type: String},
	_passhash2: {type: String},
	_passsalt: {type: String},
	name: {type: String},
	status: {type: String, enum: ['active', 'deleted'], default: 'active', index: true},
	role: {type: String, enum: ['user', 'admin', 'root'], default: 'user', index: true},
	settings: {type: 'object', default: {}},
	created: {type: Date, default: Date.now},
	lastLogin: {type: Date, default: Date.now},
	title: {type: String},
	libraryNo: {type: String},
	faculty: {type: String},
	position: {
		undergrad: {type: Boolean},
		postgrad: {type: Boolean},
		phd: {type: Boolean},
		staff: {type: Boolean},
	},
});

// Deal with logins + user passwords {{{
var crypto = require('crypto');

User
	.virtual('password', null, function(password) { // Allow write but not read
		this._passsalt = crypto.randomBytes(16).toString('base64');
		this._passhash = this.encryptPass(this._passsalt, password);
	})
	.method('encryptPass', function(salt, password) {
		var saltBuffer = new Buffer(salt, 'base64')
		return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64).toString('base64');
	})
	.method('validPassword', function(candidate, next) {
		return next(null, this.encryptPass(this._passsalt || '', candidate) == this._passhash);
	});
// }}}

// Setup utility methods {{{
User
	.method('splitName', function() {
		var nameBits = this.name.split(/\s+/);
		return {
			first: nameBits[0],
			last: nameBits.length > 1 ? nameBits[nameBits.length - 1] : null,
			other: nameBits.length > 2 ? nameBits.slice(1, -1).join(' ') : null,
		};
	});
// }}
