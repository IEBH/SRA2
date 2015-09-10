var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');

module.exports = function(finish, task) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			_.defaults(task.settings, {
				deburr: true,
				weights: { // Indicates the fields to be extracted and their weights
					title: 1,
					keyword: 1,
					abstract: 1,
				},
				ignore: {
					common: true,
					numbers: true,
				},
				min: 3,
			});
			if (!task.settings) return next('.settings object must be present for request');
			next();
		})
		// }}}

		// Retrieve data {{{
		.parallel({
			library: function(next) {
				Libraries.findOne({_id: task.library}, next);
			},
			references: function(next) {
				References.find({
					_id: {"$in": task.references},
				}, next);
			},
			historyTask: function(next) {
				task.progress.current = 0;
				task.progress.max = task.references.length;
				task.history.push({type: 'status', response: 'Going to process ' + task.references.length + ' references'});
				next();
			},
		})
		// }}}

		// Worker {{{
		.set('words', {})

		.forEach('references', function(nextRef, ref) {
			var self = this;

			_.keys(task.settings.weights).forEach(function(key) {
				if (!ref[key]) return;

				var val = ref[key].toLowerCase();

				// Deburr?
				if (task.settings.deburr) val = _.deburr(val);

				// Strip punctuation
				val = val.replace(/[\!\@\#\$\%\^\&\*\(\)\[\]\{\}\;\:\'\"\<\>\,\.]+/g, '');

				// Split up if not already an array
				if (!_.isArray(val)) val = val.split(/\s+/);

				// Count all the words
				val.forEach(function(word) {
					// Ignore rules {{{
					if (!word) return;
					if (
						task.settings.ignore.common &&
						/^(a|also|am|an|and|any|are|as|at|be|been|but|by|can|did|do|get|had|has|have|he|him|i|if|in|into|is|it|its|itself|last|may|me|met|more|no|not|of|on|only|or|over|see|set|she|should|some|such|that|them|then|there|these|the|they|this|to|up|upon|use|used|was|well|were|which|who|will|with|we)$/.test(word)
					) return;

					if (task.settings.ignore.numbers) {
						if (/^[0-9\.,]+$/.test(word)) return;
						if (/^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/.test(word)) return;
						if (/(one|two|three|four|five|six|seven|eight|nine|teen)$/.test(word)) return;
						if (/^(twenty|thirty|fourty|fifty|sixty|seventy|eighty|ninety)/.test(word)) return;
					}
					// }}}

					if (!self.words[word]) self.words[word] = 0;
					self.words[word] += (task.settings.weights[key] || 1);
				});
			});

			nextRef();
		})

		// Apply settings.min
		.then(function(next) {
			var self = this;
			if (!task.settings.min) return next();
			
			_.forEach(this.words, function(count, word) {
				if (count < task.settings.min)
					delete self.words[word];
			});
			next();
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.destination = config.url + '/#/libraries/' + this.library._id + '/word-freq/' + task._id;
			task.history.push({type: 'completed', response: 'Completed word frequency operation'});
			task.completed = new Date();
			task.status = 'completed';
			task.result = this.words;
			task.save(next);
		})
		.end(finish);
		// }}}
};
