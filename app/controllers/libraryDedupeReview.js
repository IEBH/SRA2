app.controller('libraryDedupeReviewController', function($scope, $location, $q, $rootScope, References) {
	// Deal with breadcrumbs {{{
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'De-duplicate');
	});
	// }}}

	// Dedupe overall process {{{
	/**
	* End the dedupe review
	*/
	$scope.dedupeEnd = function() {
		$scope.library.dedupeStatus = 'none';
		$scope.save('dedupeStatus', '/libraries/' + $scope.library._id);
	};
	// }}}

	// Individual references {{{
	/**
	* Select the field value to use from a number of alternates
	* @param object ref The reference to change
	* @param string key The key to set the value of
	* @param mixed value The value to set
	*/
	$scope.dedupeSetAlternate = function(ref, key, value) {
		ref[key] = value;

		// Recalculate the selected field based on _.isEqual to figure out which one the user selected
		var DDF = _.find(ref.duplicateDataFields, {key: key});
		if (!DDF) return console.warn('Cannot find ref.duplicateDataFields meta entry for key', key, 'on ref', ref);
		DDF.selected = _.mapValues(DDF.selected, function(val, dupIndex) {
			return _.isEqual(ref[key], ref.duplicateData[dupIndex].conflicting[key]);
		});


		// Save to server
		var saveData = {};
		saveData[key] = value;

		References.save({id: ref._id}, saveData);
	};

	/**
	* Signal that the user has finished with this reference
	* Really just delets the .duplicateData field from the ref and removes it from the list of references
	* @param object ref The reference we are finished with
	* @return promise
	*/
	$scope.dedupeSetDone = function(ref) {
		// Save to server
		var promise = $q.all([
			References.save({id: ref._id}, {duplicateData: []}).$promise,

			$scope.refreshStats(),
		]);

		// Nuke from array
		_.remove($scope.references, {_id: ref._id});

		return promise;
	};

	/**
	* Signal that none of the items marked are dupes
	* We cycle though all the items and mark them as 'active' (from 'dupe') and then call dedupeSetDone
	* @param object ref The reference we are finished with
	* @return promise
	*/
	$scope.dedupeSetNotDupe = function(ref) {
		return $q
			.all(
				ref.duplicateData.slice(1).map(dupe => References.save({id: dupe.reference}, {status: 'active'}).$promise)
			)
			.then(() => $scope.dedupeSetDone(ref));
	};

	/**
	* Delete all marked references
	* @param object ref The reference we are finished with
	* @return promise
	*/
	$scope.dedupeSetDelete = function(ref) {
		return $q
			.all(
				ref.duplicateData.map(dupe => References.save({id: dupe.reference}, {status: 'deleted'}).$promise)
			)
			.then(() => $scope.dedupeSetDone(ref));
	};
	// }}}

	// Loader {{{
	$scope.stats = {
		active: undefined,
		dupes: undefined,
		deleted: undefined,
	};
	$scope.loading = true;
	$scope.refresh = function() {
		return $q
			.all([
				$scope.refreshStats(),

				References.query({
					library: $scope.library._id,
					status: 'active',
					'duplicateData.0': {$exists: true},
				}).$promise
					.then(function(data) {
						$scope.references = data
							// Decorators {{{
							.map(ref => {
								// .duplicateDataFields - collection of fields selectable for this ref {{{
								ref.duplicateDataFields = [];

								ref.duplicateData.forEach((dup, dupIndex) => {
									_.keys(dup.conflicting).forEach(function(k) {
										var fieldInfo = _.find(ref.duplicateDataFields, {key: k});
										if (!fieldInfo) {
											fieldInfo = {
												key: k,
												selected: {},
											};
											ref.duplicateDataFields.push(fieldInfo);
										}

										fieldInfo.selected[dupIndex] = _.isEqual(ref[k], dup.conflicting[k]);
									});
								});
								// }}}
								return ref;
							})
							.filter(ref => ref.duplicateDataFields.length > 0)
							// }}}
					}),

			])
			.finally(function() {
				$scope.loading = false;
			});

	};

	/**
	* Refresh the stats for the library
	* @return promise
	*/
	$scope.refreshStats = function() {
		return $q.all([
			References.count({library: $scope.library._id, status: 'active'}).$promise
				.then(countData => $scope.stats.active = countData.count),

			References.count({library: $scope.library._id, status: 'dupe'}).$promise
				.then(countData => $scope.stats.dupes = countData.count),

			References.count({library: $scope.library._id, status: 'deleted'}).$promise
				.then(countData => $scope.stats.deleted = countData.count),
		]);
	};
	// }}}

	$scope.refresh();
});
