var monoxide = require('monoxide');

var User = module.exports = monoxide.schema('users', {
	username: {type: 'string', required: true, index: {unique: true}},
	email: {type: 'string', required: true, index: {unique: true}},
	_passhash: {type: 'string'},
	_passhash2: {type: 'string'},
	_passsalt: {type: 'string'},
	_token: {type: 'string'},
	name: {type: 'string'},
	status: {type: 'string', enum: ['active', 'deleted'], default: 'active', index: true},
	role: {type: 'string', enum: ['user', 'admin', 'root'], default: 'user', index: true},
	settings: {type: 'object', default: {}},
	created: {type: 'date', default: Date.now},
	lastLogin: {type: 'date', default: Date.now},
	title: {type: 'string'},
	libraryNo: {type: 'string'},
	faculty: {type: 'string'},
	position: {
		undergrad: {type: 'boolean'},
		postgrad: {type: 'boolean'},
		phd: {type: 'boolean'},
		staff: {type: 'boolean'},
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
