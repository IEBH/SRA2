/**
* Fetch a list of libraries
* @param {boolean} [fetchCounts=false] If the DOM property $element.fetchCounts is true the reference count of each library is fetched
*/
app.controller('libraryListController', function($scope, $element, $q, Libraries, References, Users, $location) {
	$scope.libraries = null;

	$scope.$watchGroup(['libraryAllowNew', 'libraries'], function() {
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
		Libraries.query({status: 'active', owners: $scope.user._id}).$promise
			.then(function(data) {
				var countPromises = [];

				$scope.libraries = data
					// Decorators {{{
					// .referenceCount {{{
					.map(function(library) {
						if (angular.element($element).attr('fetch-counts') != 'true') return library; // Dont fetch if !$element.fetchCounts
						library.referenceCount = 'loading';
						countPromises.push(function() {
							return References.count({
								library: library._id,
								status: 'active',
							}).$promise.then(function(countData) {
								library.referenceCount = countData.count;
							});
						});
						return library;
					});
					// }}}
					// }}}

				$q.allLimit(3, countPromises);
			});
	};
	// }}}

	var userUnwatch = $scope.$watch('user._id', function() {
		if (!$scope.user || !$scope.user._id) return; // User not yet loaded
		$scope.refresh();
		userUnwatch();
	});
});
