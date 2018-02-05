var crypto = require('crypto');

var name = 'users';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	username: {type: String, required: true, index: {unique: true}},
	email: {type: String, required: true, index: {unique: true}},
	_passhash: {type: String},
	_passhash2: {type: String},
	_passsalt: {type: String},
	_token: {type: String},
	name: {type: String},
	status: {type: String, enum: ['active', 'deleted'], default: 'active', index: true},
	role: {type: String, enum: ['user', 'admin', 'root'], default: 'user', index: true},
	settings: {type: mongoose.Schema.Types.Mixed, default: {}},
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
schema
	.virtual('password')
	.set(function(password) {
		this._passsalt = crypto.randomBytes(16).toString('base64');
		this._passhash = this.encryptPass(this._passsalt, password);
	});

schema.methods.encryptPass = function(salt, password) {
	var saltBuffer = new Buffer(salt, 'base64')
	return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64, 'sha1').toString('base64');
};

schema.methods.validPassword = function(candidate, next) {
	return next(null, this.encryptPass(this._passsalt || '', candidate) == this._passhash);
};
// }}}

schema.statics.findByLogin = function(req, username, password, next) {
	this
		.findOne({username: username})
		.exec(function (err, user) {
			if (err) return next(err);
			if (!user)
				return next(null, false, req.flash('passportMessage', 'Incorrect username'));
			user.validPassword(password, function(err, isMatch) {
				if (err) return next(err);
				if (!isMatch) return next(null, false, req.flash('passportMessage', 'Incorrect password'));
				return next(null, user);
			});
		});
};

schema.virtual('data') // user.data returns the public facing user profile (i.e. hide passwords and stuff frontend people shouldn't see)
	.get(function() {
		return {
			_id: this._id,
			username: this.username,
			email: this.email,
			name: this.name,
			isAdmin: (this.role != 'user'),
			isRoot: (this.role == 'root'),
			title: this.title,
			libraryNo: this.libraryNo,
			faculty: this.faculty,
			position: this.position,
		};
	});

schema.methods.splitName = function() {
	var nameBits = this.name.split(/\s+/);
	return {
		first: nameBits[0],
		last: nameBits.length > 1 ? nameBits[nameBits.length - 1] : null,
		other: nameBits.length > 2 ? nameBits.slice(1, -1).join(' ') : null,
	};
};

module.exports = mongoose.model(name, schema);
