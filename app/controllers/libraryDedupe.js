app.controller('libraryDedupeController', function($scope, $location, $rootScope, References) {
	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'De-duplicate');
	});
	// }}}

	/**
	* End the dedupe review
	*/
	$scope.dedupeEnd = function() {
		$scope.library.dedupeStatus = 'none';
		$scope.save('dedupeStatus', '/libraries/' + $scope.library._id);
	};

	$scope.dedupeSetAlternate = function(ref, key, value) {
		ref[key] = value;
		var DDF = _.find(ref.duplicateDataFields, {key: key});
		if (!DDF) return console.warn('Cannot find ref.duplicateDataFields meta entry for key', key, 'on ref', ref);
		DDF.selected = _.mapValues(DDF.selected, function(val, dupIndex) {
			return _.isEqual(ref[key], ref.duplicateData[dupIndex].conflicting[key]);
		});
	};

	// Loader {{{
	$scope.loading = true;
	$scope.refresh = function() {
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
					});
					// }}}
			})
			.finally(function() {
				$scope.loading = false;
			});
	};
	// }}}

	$scope.refresh();
});
