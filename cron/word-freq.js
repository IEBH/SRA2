var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
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
					keywords: 1,
					abstract: 1,
				},
				ignore: {
					common: true,
					numbers: true,
				},
				min: {
					points: 3,
					unique: 0,
				},
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
			var uniques = {}; // Words detected in this reference

			_.keys(task.settings.weights).forEach(function(key) {
				if (!ref[key]) return;

				var val = ref[key].toLowerCase();

				// Deburr?
				if (task.settings.deburr) val = _.deburr(val);

				// Strip punctuation
				val = val.replace(/[=\+\-\!\@\#\$\%\^\&\*\(\)\[\]\{\}\;\:\'\"\<\>\,\.]+/g, '');

				// Split up if not already an array
				if (!_.isArray(val)) val = val.split(/\s+/);

				// Count all the words
				val.forEach(function(word) {
					// Ignore rules {{{
					if (!word) return;
					if (
						task.settings.ignore.common &&
						/^(a|also|am|an|and|any|are|as|at|be|been|but|by|can|could|did|do|for|get|had|has|have|he|him|i|if|in|into|is|it|its|itself|last|may|me|met|more|n|no|not|p|of|on|only|or|our|over|see|set|she|should|some|such|than|that|them|then|their|there|these|the|they|this|to|up|upon|use|used|was|well|were|which|who|will|with|we|vs)$/.test(word)
					) return;

					if (task.settings.ignore.numbers) {
						if (/^[0-9\.,]+$/.test(word)) return;
						if (/^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/.test(word)) return;
						if (/(one|two|three|four|five|six|seven|eight|nine|teen)$/.test(word)) return;
						if (/^(twenty|thirty|fourty|fifty|sixty|seventy|eighty|ninety)/.test(word)) return;
					}
					// }}}

					if (!self.words[word]) {
						self.words[word] = {
							points: 0,
							unique: 0,
						};
						_.keys(task.settings.weights).forEach(function(key) {
							self.words[word][key] = 0;
						});
					}

					self.words[word].points += (task.settings.weights[key] || 1);
					self.words[word][key]++;
					if (!uniques[word]) {
						self.words[word].unique++;
						uniques[word] = true;
					}
				});
			});

			// Update progress
			task.progress.current++;
			task.save(nextRef);
		})

		// Flatten entire structure into a collection
		.then('words', function(next) {
			next(null, _.map(this.words, function(data, word) {
				data.word = word;
				return data;
			}));
		})

		// Apply settings.min
		.then('words', function(next) {
			if (!task.settings.min.points && !task.settings.min.unique) return next(null, this.words);
			next(null, this.words.filter(function(word) {
				return !(
					(task.settings.min.points && word.points < task.settings.min.points) ||
					(task.settings.min.unique && word.unique < task.settings.min.unique)
				)
			}));
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.destination = config.url + '/#/libraries/' + this.library._id + '/word-freq/' + task._id;
			task.history.push({type: 'completed', response: 'Completed word frequency operation'});
			task.completed = new Date();
			task.status = 'completed';
			task.result = {
				fields: _.keys(task.settings.weights),
				words: this.words,
			};
			task.save(next);
		})
		.end(finish);
		// }}}
};
