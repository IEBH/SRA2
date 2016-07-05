app.controller('replicantGenerateController', function($scope, $location, $sce, $stateParams, Loader, Replicant) {
	// Data refresher {{{
	$scope.generated;
	$scope.refresh = function() {
		if (!$stateParams.id) return $location.path('/replicant');

		Loader.start()
			.title('Generating content')
			.text('Processing RevMan file...');

		Replicant.generate({id: $stateParams.id}).$promise
			.then(data => $scope.generated = data)
			.then(() => $scope.generated.content = $sce.trustAsHtml($scope.generated.content))
			.finally(() => Loader.finish());
	};
	// }}}

	$scope.$evalAsync($scope.refresh);
});
