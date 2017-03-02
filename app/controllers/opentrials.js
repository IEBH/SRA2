app.controller('OpenTrialsController', function($scope, Searches) {
	$scope.searching = false;
	$scope.query = '';
	$scope.records;

	// Types {{{
	$scope.types = [
		{id: 'trials', title: 'Trials'},
		{id: 'records', title: 'Records'},
	];
	$scope.type = $scope.types[0];

	$scope.setType = type => $scope.type = type;
	// }}}

	$scope.submit = function() {
		$scope.searching = true;
		Searches.opentrials({
			q: $scope.query,
		}).$promise
			.then(data => $scope.records = data)
			.finally(_=> $scope.searching = false)
	};
});
