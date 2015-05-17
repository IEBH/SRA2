app.controller('libraryListController', function($scope, Libraries) {
	$scope.libraries = null;

	$scope.$watch('libraryAllowNew + libraries', function() {
		if (!$scope.libraries) return;
		if ($scope.libraryAllowNew && $scope.libraries[0]._id == 'new') { // Already present
			return;
		} else if ($scope.libraryAllowNew) { // Prepend
			$scope.libraries.splice(0, 0, {_id: 'new', title: 'Create new library'});
		} else if (!$scope.libraryAllowNew && $scope.libraries[0]._id == 'new') { // Disable
			$scope.libraries.splice(0, 1);
		}
		$scope.libraries.splice
	});

	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.user) return;
		Libraries.query({status: 'active', owners: $scope.user._id}).$promise.then(function(data) {
			$scope.libraries = data;
		});
	};
	$scope.refresh();
	// }}}
});
