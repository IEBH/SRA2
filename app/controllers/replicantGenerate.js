app.controller('replicantGenerateController', function($scope, $location, $stateParams, Loader, Replicant) {
	// Data refresher {{{
	$scope.generated;
	$scope.refresh = function() {
		if (!$stateParams.id) return $location.path('/replicant');

		Loader.start()
			.title('Generating content')
			.text('Processing RevMan file...');

		Replicant.generate({id: $stateParams.id}).$promise
			.then(data => $scope.generated = data)
			.finally(() => Loader.finish());
	};
	// }}}

	$scope.$evalAsync($scope.refresh);
});
