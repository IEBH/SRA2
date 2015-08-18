app.controller('libraryListController', function($scope, Libraries, References, Users, $location) {
	$scope.libraries = null;

	$scope.$watch('libraryAllowNew + libraries', function() {
		if (!$scope.libraries) return;
		if ($scope.libraryAllowNew && $scope.libraries.length > 0 && $scope.libraries[0]._id == 'new') { // Already present
			return;
		} else if ($scope.libraryAllowNew) { // Prepend
			$scope.libraries.splice(0, 0, {_id: 'new', title: 'Create new library'});
		} else if (!$scope.libraryAllowNew && $scope.libraries.length > 0 && $scope.libraries[0]._id == 'new') { // Disable
			$scope.libraries.splice(0, 1);
		}

		// Default to new if no library is currently selected
		if ($scope.libraryAllowNew && !$scope.library) $scope.library = $scope.libraries[0];
	});

	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.user) return;
		Libraries.query({status: 'active', owners: $scope.user._id}).$promise.then(function(data) {
			$scope.libraries = data
				// Decorators {{{
				// .referenceCount {{{
				.map(function(library) {
					library.referenceCount = null;
					References.count({library: library._id}).$promise.then(function(countData) {
						library.referenceCount = countData.count;
					});
					return library;
				});
				// }}}
				// }}}
		});
	};
	$scope.$evalAsync($scope.refresh);
	// }}}
});
