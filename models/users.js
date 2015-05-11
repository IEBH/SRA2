var crypto = require('crypto');

var name = 'users';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	username: {type: String, required: true, index: {unique: true}},
	email: {type: String, required: true, index: {unique: true}},
	passhash: {type: String},
	passhash2: {type: String},
	passsalt: {type: String},
	name: {type: String},
	status: {type: String, enum: ['active', 'deleted'], default: 'active'},
	role: {type: String, enum: ['user', 'admin', 'root'], default: 'user'},
	settings: {type: mongoose.Schema.Types.Mixed, default: {}},
	created: {type: Date, default: Date.now},
	lastLogin: {type: Date, default: Date.now},
});

// Deal with logins + user passwords {{{
schema
	.virtual('password')
	.set(function(password) {
		this.passsalt = crypto.randomBytes(16).toString('base64');
		this.passhash = this.encryptPass(this.passsalt, password);
	});

schema.methods.encryptPass = function(salt, password) {
	var saltBuffer = new Buffer(salt, 'base64')
	return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64).toString('base64');
};

schema.methods.validPassword = function(candidate, next) {
	return next(null, this.encryptPass(this.passsalt, candidate) == this.passhash);
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
		};
	});

module.exports = mongoose.model(name, schema);
