var _ = require('lodash');
var async = require('async-chainable');
var email = require('email').Email;
var Libraries = require('../models/libraries');
var moment = require('moment');
var References = require('../models/references');

module.exports = function(finish, task) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!task.settings) return next('.settings object must be present for request');
			if (!task.settings.user) return next('.settings.user object must be present for request');
			next();
		})
		// }}}

		// Retrieve data {{{
		.parallel({
			library: function(next) {
				Libraries.find({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, next);
			},
			historyTask: function(next) {
				task.progress.current = 0;
				task.progress.max = task.references.length;
				task.history.push({type: 'status', response: 'Going to request ' + task.references.length + ' references'});
				next();
			},
		})
		// }}}

		// Clean up data {{{
		.then(function(next) {
			if (task.settings.user.name && !_.isObject(task.settings.user.name)) {
				var nameBits = task.settings.user.name.split(/\s+/);
				task.settings.user.name = {
					first: nameBits[0],
					last: nameBits.length > 1 ? nameBits[nameBits.length - 1] : null,
					other: nameBits.length > 2 ? nameBits.slice(1, -1).join(' ') : null,
				};
			}
			next();
		})
		// }}}

		// Send requests {{{
		.forEach('references', function(nextRef, ref) {
			async()
				.then('html', function(next) {
					var refDate = moment(ref.date);
					if (!refDate.isValid()) refDate = null;

					next(null,
						'<table border="1" cellspacing="0" cellpadding="5">' +
							'<tr>' +
								'<th>FIELD</th>' +
								'<th>&nbsp;</th>' +
								'<th>VALUE</th>' +
							'</tr>' +
							'<tr><td>Title</td><td>=</td><td>' + (task.settings.user.title || '') + '</td></tr>' +
							'<tr><td>Library_Barcode</td><td>=</td><td>' + (task.settings.user.libraryNo || '') + '</td></tr>' +
							'<tr><td>First_Name</td><td>=</td><td>' + (task.settings.user.name.first || '') + '</td></tr>' +
							'<tr><td>Last_Name</td><td>=</td><td>' + (task.settings.user.name.last || '') + '</td></tr>' +
							'<tr><td>Email</td><td>=</td><td>' + (task.settings.user.email || '') + '</td></tr>' +
							'<tr><td>Faculty</td><td>=</td><td>' + (task.settings.user.faculty || '') + '</td></tr>' +
							(task.settings.user.position.postgrad ? '<tr><td>Position1</td><td>=</td><td>Postgrad</td></tr>' : '') +
							(task.settings.user.position.undergrad ? '<tr><td>Position2</td><td>=</td><td>Undergrad</td></tr>' : '') +
							(task.settings.user.position.phd ? '<tr><td>Position3</td><td>=</td><td>Phd</td></tr>' : '') +
							(task.settings.user.position.staff ? '<tr><td>Position4</td><td>=</td><td>Staff</td></tr>' : '') +
							'<tr><td>checkbox3</td><td>=</td><td>Checked Library Holdings</td></tr>' +
							'<tr><td>Bond</td><td>=</td><td>Currently Enrolled</td></tr>' +
							'<tr><td>Date_of_Request2</td><td>=</td><td>' + (moment().format('DD/MM/YYYY')) + '</td></tr>' +
							'<tr><td>Journal_Title2</td><td>=</td><td>' + (ref.journal || '') + '</td></tr>' +
							'<tr><td>Vol</td><td>=</td><td>' + (ref.volume || '') + '</td></tr>' +
							'<tr><td>Issue</td><td>=</td><td>' + (ref.issue || '') + '</td></tr>' +
							'<tr><td>ISSN</td><td>=</td><td>' + (ref.isbn || '') + '</td></tr>' +
							'<tr><td>Month</td><td>=</td><td>' + (refDate ? refDate.format('MMMM') : '') + '</td></tr>' +
							'<tr><td>Year</td><td>=</td><td>' + (ref.date ? refDate.format('YYYY') : '') + '</td></tr>' +
							'<tr><td>Pages</td><td>=</td><td>' + (ref.pages || '') + '</td></tr>' +
							'<tr><td>Article_Author2</td><td>=</td><td>' + (ref.authors ? ref.authors.join(', ') : '') + '</td></tr>' +
							'<tr><td>Article_Title2</td><td>=</td><td>' + (ref.title || '') + '</td></tr>' +
							'<tr><td>Reference2</td><td>=</td><td>&nbsp;</td></tr>' +
							'<tr><td>No_Use_Date2</td><td>=</td><td>&nbsp;</td></tr>' +
							'<tr><td>declaration2</td><td>=</td><td>Declaration Checked</td></tr>' +
							'<tr><td>Submit</td><td>=</td><td>Submit your request</td></tr>' +
						'</table>'
					);
				})
				.then(function(next) {
					new email({
						from: config.library.request.email.from || task.settings.user.title.email,
						to: config.library.request.email.to,
						cc: config.library.request.email.cc,
						bcc: config.library.request.email.bcc,
						subject: 'Document delivery request',
						body: this.html,
						bodyType: 'html',
					}).send(next);
				})
				.then(function(next) {
					task.history.push({type: 'response', response: this.response});
					task.progress.current++;
					task.save(next);
				})
				.end(nextRef);
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.history.push({type: 'completed', response: 'Completed request operation'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
