app.controller('libraryListController', function($scope, Libraries) {
	$scope.libraries = null;

	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.user) return;
		Libraries.query({owners: $scope.user._id}).$promise.then(function(data) {
			$scope.libraries = data;
		});
	};
	$scope.refresh();
	// }}}
});
