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
					abstract: 1,
					keywords: 1,
				},
				ignore: {
					common: true,
					numbers: true,
				},
				min: {
					points: 3,
					unique: 0,
				},
				max: {
					results: 500, // Anything above this limit gets truncated by the resultsTruncate field
					resultsTruncate: 'points',
				},
				combineWords: 1, // How many word combinations should be examined (1=one word,2=two words etc.)
			});

			if (!task.settings) return next('.settings object must be present for request');
			if (task.settings.combineWords > 5) next('combineWords has a maximum of 5');
			if (task.settings.max.results > 500) next('Maximum number of references is too high');
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

				var counted = {}; // Object `${sentence}`=>true storage of keys we have already seen
				var lastWords = [];
				
				_(
					_.isArray(ref[key]) ? // Is an array - split each element by whitespace
						_(ref[key])
							.map(x => x.split(/\s+/))
							.flatten()
							.value()
						: ref[key].split(/[\s\=\+\-\?\!\@\#\$\%\^\&\*\(\)\[\]\{\}\;\:\"\<\>\,\.\/]+/) // Is a string - split by whitespace or punctuation
				)
					.map(v => v.toLowerCase()) // Lower case everything
					.map(v => task.settings.deburr ? _.deburr(v) : v) // Deburr?
					.map(v => v.replace(/[\=\+\-\?\!\@\#\$\%\^\&\*\(\)\[\]\{\}\;\:\'\"\<\>\,\.\/]+/g, '')) // Strip punctuation
					.forEach(function(word, wordIndex) {
						// Ignore rules {{{
						if (
							!word || // Is blank
							( // Is a common word?
								task.settings.ignore.common &&
								/^(a|also|am|an|and|any|are|as|at|be|been|but|by|can|could|did|do|for|get|had|has|have|he|him|i|if|in|into|is|it|its|itself|last|may|me|met|more|n|no|not|p|of|on|only|or|our|over|see|set|she|should|some|such|than|that|them|then|their|there|these|the|they|this|to|up|upon|use|used|was|well|were|which|who|will|with|we|v|vs)$/.test(word)
							) ||
							( // Is a number?
								task.settings.ignore.numbers &&
								(
									/^[0-9\.,]+$/.test(word) ||
									/^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/.test(word) ||
									/(one|two|three|four|five|six|seven|eight|nine|teen)$/.test(word) ||
									/^(twenty|thirty|fourty|fifty|sixty|seventy|eighty|ninety)/.test(word)
								)
							)
						) {
							lastWords = []; // Reset buffer
							return;
						}
						// }}}


						lastWords.push(word); // Add last word to stack
						if (lastWords.length > task.settings.combineWords) lastWords.shift(); // Turn stack into circular array where we clip from the beginning (FILO)

						_.times(task.settings.combineWords, function(offset) {
							if (lastWords.length - 1 < offset) return;
							var sentence = lastWords.slice(0 - (offset+1));

							var wordGroup = sentence.join(' ');

							if (!self.words[wordGroup]) {
								self.words[wordGroup] = {
									points: 0,
									unique: 0,
								};
								_.keys(task.settings.weights).forEach(function(key) {
									self.words[wordGroup][key] = 0;
								});
							}
							
							if (!counted[wordGroup]) {
								self.words[wordGroup].points += (task.settings.weights[key] || 1);
								self.words[wordGroup][key]++;
								counted[wordGroup] = true; // Keep track of whether we have seen this word grouping before in this reference so we dont count it twice
								if (!uniques[wordGroup]) {
									self.words[wordGroup].unique++;
									uniques[wordGroup] = true;
								}
							}
						});
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

		// Truncate if we have too many results
		.then('words', function(next) {
			if (this.words.length <= task.settings.max.results) return next(null, this.words);

			next(null, 
				_(this.words)
					.sortBy(task.settings.max.resultsTruncate)
					.reverse()
					.slice(0, task.settings.max.results)
					.value()
			);
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
				fields: [
					{id: 'title', title: 'Title'},
					{id: 'abstract', title: 'Abstract'},
					{id: 'keywords', title: 'Keywords'},
				],
				words: this.words,
			};
			task.save(next);
		})
		.end(finish);
		// }}}
};
