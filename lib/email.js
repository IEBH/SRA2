/**
* Generic email dispatch library
* This is a very thin wrapper around NodeMailer. Go see its documentation for more details - https://github.com/nodemailer/nodemailer
*
* This library uses the following keys in config to determine its behaviour
*
* 	ALL Methods:
* 	- config.email.enabled - Temporarily disable email
* 	- config.email.method - what transport profile to use, see init()
*	- config.email.{to,from,subject,cc,bcc} - Default fields to use if unspecified
*
*	For MailGun API:
* 	- config.mailgun.apiKey
* 	- config.mailgun.domain - something like 'acme.com' (no 'http://' prefix or mailgun suffix)
*/

var _ = require('lodash');
var colors = require('colors');
var nodemailer = require('nodemailer');
var nodemailerMailgun = require('nodemailer-mailgun-transport');
var nodemailerSendmail = require('nodemailer-sendmail-transport');

var hasInit = false; // Have called init()
var transporter;

function init() {
	if (!config.email.enabled) return;
	// Work out mail transport {{{
	switch (config.email.method) {
		case 'mailgun':
			transporter = nodemailer.createTransport(nodemailerMailgun({
				auth: {
					api_key: config.mailgun.apiKey,
					domain: config.mailgun.domain,
				},
			}));
			break
		case 'sendmail':
			transporter = nodemailer.createTransport(nodemailerSendmail());
			break;
		default:
			next('Unknown mail transport method: ' + config.library.request.method);
	}
	// }}}

	hasInit = true;
}


/**
* Send an email
* All addresses can be plain email addresses ('foo@bar.com') or aliased ('Mr Foo Bar <foo@bar.com>')
* Either mail.html or mail.text must be specified
*
* @param {Object} mail The mail object to dispatch
* @param {string} [mail.html] HTML payload of the email
* @param {srting} [mail.text] Plain text payload of the email
* @param {string} [mail.from] The from portion of the email (defaults to config.email.from if unspecified)
* @param {string} [mail.to] The to portion of the email (defaults to config.email.to if unspecified)
* @param {string} [mail.subject] The from portion of the email (defaults to config.email.subject if unspecified)
* @param {string} [mail.cc] The from portion of the email (defaults to config.email.cc if unspecified)
* @param {string} [mail.bcc] The from portion of the email (defaults to config.email.bcc if unspecified)
* @param {function} callback The callback to invoke on completion
* @return {Object} This chainable object
*/
function send(mail, callback) {
	if (!hasInit) init();
	_.defaults(mail, {
		from: config.email.from,
		to: config.email.to,
		subject: '',
		cc: [],
		bcc: [],
	});

	['cc', 'bcc'].forEach(function(f) { // Delete blank fields
		if (_.isEmpty(mail[f])) delete mail[f];
	});

	if (_.isEmpty(mail.text) && _.isEmpty(mail.html)) throw new Error('Neither mail.html or mail.text is specified when trying to send an email');

	if (!config.email.enabled) {
		return callback();
		console.log(colors.blue('[Email]', 'Mail sending disabled. Would deliver email', colors.cyan(mail.subject), 'to', mail.to));
	} else {
		console.log(colors.blue('[Email]', 'Sending', colors.cyan(mail.subject), 'to', mail.to));
		transporter.sendMail(mail, callback);
	}

	return this;
}


module.exports = {
	init: init,
	send: send,
};
