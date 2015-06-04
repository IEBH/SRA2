app.controller('SearchController', function($scope, Searches) {
	$scope.query = '';
	$scope.method = 'pubmed';
	$scope.response = null;

	$scope.submit = function() {
		Searches.get({
			method: $scope.method,
			q: $scope.query,
		}).$promise.then(function(data) {
			$scope.response = data;
		});
	};
});
