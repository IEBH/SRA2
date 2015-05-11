app.controller('libraryListController', function($scope, Library) {
	$scope.libraries = null;

	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.user) return;
		Library.query({owners: $scope.user._id}).$promise.then(function(data) {
			$scope.libraries = data;
		});
	};
	$scope.refresh();
	// }}}
});
