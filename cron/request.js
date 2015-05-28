var async = require('async-chainable');
var Libraries = require('../models/libraries');
var moment = require('moment');
var References = require('../models/references');
var request = require('superagent');

module.exports = function(finish, task) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			console.log('TASK IS', task);
			if (!task.settings.user) return next('.user object must be present for request');
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

		// Make request(s) {{{
		.forEach('references', function(nextRef, ref) {
			async()
				.then('response', function(next) {
					var data = {
						Title: task.settings.user.title || '',
						Library_Barcode: task.settings.user.libraryNo || '',
						First_Name: task.settings.user.splitName().first || '',
						Last_Name: task.settings.user.splitName().last || '',
						Email: task.settings.user.email || '',
						Faculty: task.settings.user.faculty || '',
						checkbox3: 'Checked Library Holdings',
						Bond: 'Currently Enrolled',
						Date_of_Request2: moment().format('DD/MM/YYYY'),
						Journal_Title2: ref.journal || '',
						Vol: ref.volume || '',
						Issue: ref.issue || '',
						ISSN: ref.isbn || '',
						Month: _.isDate(ref.date) ? moment(ref.date).format('MMMM') : '',
						Year: _.isDate(ref.date) ? moment(ref.date).format('YYYY') : '',
						Pages: ref.pages || '',
						Article_Author2: ref.authors ? ref.authors.join(', ') : '',
						Article_Title2: ref.title || '',
						Referemce2: '',
						No_Use_Date2: '',
						declaration2: 'Declaration Checked',
					};
					if (task.settings.user.position.postgrad) data['Position1'] = 'Postgrad';
					if (task.settings.user.position.undergrad) data['Position2'] = 'Undergrad';
					if (task.settings.user.position.phd) data['Position3'] = 'Phd';
					if (task.settings.user.position.staff) data['Position4'] = 'Staff';

					request.post(config.library.request.url)
						.send(data)
						.timeout(config.library.request.timeout)
						.end(function(err, res) {
							if (err) return next(err);
							if (!res.ok) return next("Failed libarry request, return code: " + res.statusCode + ' - ' + res.text);
							next(null, res.text);
						});
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
			task.save(next);
		})
		.end(finish);
		// }}}
};
