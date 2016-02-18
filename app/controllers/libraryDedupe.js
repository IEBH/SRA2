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
		}).$promise
			.then(function(data) {
				$scope.references = data;
			})
			.finally(function() {
				$scope.loading = false;
			});
	};
	// }}}

	$scope.refresh();
});
