app.controller('libraryController', function($scope, $location, $routeParams, Libraries, References) {
	$scope.library = null;
	$scope.references = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.library) return;
		Libraries.get({id: $scope.library._id}).$promise.then(function(data) {
			$scope.library = data;
		});
		References.query({library: $scope.library._id}).$promise.then(function(data) {
			$scope.references = data;
		});
	};
	// }}}

	// Load state {{{
	if (!$routeParams.id) {
		return $location.path('/libraries');
	} else if ($routeParams.id == 'create') {
		return Libraries.create({creator: $scope.user._id}).$promise.then(function(data) {
			$location.path('/libraries/view/' + data._id);
		});
	} else {
		$scope.library = {_id: $routeParams.id};
		$scope.refresh();
	}
	// }}}
});
