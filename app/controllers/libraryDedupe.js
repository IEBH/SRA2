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

	$scope.loading = true;

	// Loader {{{
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
						// Compute .duplicateDataFields {{{
						ref.duplicateDataFields = [];

						ref.duplicateData.forEach(dup => {
							_.keys(dup.conflicting).forEach(k => ref.duplicateDataFields.push(k));
						});

						ref.duplicateDataFields = _.uniq(ref.duplicateDataFields);
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
