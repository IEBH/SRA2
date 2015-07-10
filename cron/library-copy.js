/**
* Library-copy
* Duplicate a library and its contents to another
* @params string task.settings.library Additional object to extend into the copy (can contain things like a new title)
*/
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var Libraries = require('../models/libraries');
var References = require('../models/references');
var uuid = require('uuid');

module.exports = function(finish, task) {
	async()
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
		})
		.then(function(next) {
			if (!this.library) return next('Library not found');
			if (!this.references || !this.references.length) return next('No child references found');
			next();
		})
		// }}}

		// Setup {{{
		.then(function(next) { // Setup task data
			task.progress.current = 0;
			task.progress.max = this.references.length;
			task.history.push({type: 'status', response: 'Preparing to copy ' + this.references.length + ' references'});
			task.save(next);
		})
		// }}}

		// Worker {{{
		.then(function(next) {
			if (this.library.parentage.fingerPrint) return next(); // Already has a parentage hash
			this.library.parentage.fingerPrint = uuid.v4();
			this.library.save(next);
		})

		.then('newLibrary', function(next) {
			var copy = this.library.toJSON();
			copy = _.omit(copy, [
				// Omit these fields from the copy
				'_id', '__v', 'created', 'edited', 'expiry',
			]);
			copy.parentage.parent = this.library._id;
			if (task.settings.library) _.extend(copy, task.settings.library);

			console.log('REFS SIZE', this.references.length);
			Libraries.create(copy, next);
		})

		.forEach('references', function(nextRef, ref) { // Process each reference...
			var self = this;
			async()
				.then(function(next) {
					if (ref.fingerPrint) return next(); // Source already has a hash
					ref.parentage.fingerPrint = uuid.v4();
					ref.save(next);
				})
				.then(function(next) {
					var copy = ref.toJSON();
					copy = _.omit(copy, [
						// Omit these fields from the copy
						'_id', '__v', 'created', 'edited', 'library',
					]);
					copy.library = self.newLibrary._id;
					copy.parentage.parent = ref._id;
					References.create(copy, next);
				})
				.then(function(next) {
					task.progress.current++;
					task.save(next);
				})
				.end(nextRef);
		})
		// }}}

		// Finish {{{
		.then(function(next) { // Finalize task data
			task.result = this.newLibrary.toJSON();
			task.history.push({type: 'completed', response: 'Completed copy task'});
			task.completed = new Date();
			task.status = 'completed';
			task.save(next);
		})
		.end(finish);
		// }}}
};
