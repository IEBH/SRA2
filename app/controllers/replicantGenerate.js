app.controller('replicantGenerateController', function($scope, $location, $q, $sce, $stateParams, $rootScope, Loader, Replicant) {
	// Data refresher {{{
	$scope.generated;
	$scope.refresh = function(randomize) {
		if (!$stateParams.id) return $location.path('/replicant');

		Loader.start()
			.title('Generating content')
			.text('Processing RevMan file...');

		$q.all([
			// Load in main replicant session object
			Replicant.get({id: $stateParams.id}).$promise
				.then(data => $scope.replicant = data),

			// Load in generated data
			Replicant.generate({
				id: $stateParams.id,
				randomize: randomize,
			}).$promise
				.then(data => $scope.generated = data)
				.then(() => $scope.generated.content = $sce.trustAsHtml($scope.generated.content)),
		])
			.finally(() => Loader.finish());
	};
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('replicant', function() {
		if (!$scope.replicant) return; // Not yet loaded
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/replicant', title: 'RevMan Replicant'},
			{url: '/replicant/' + $scope.replicant._id, title: $scope.replicant.title}
		]);
		$rootScope.$broadcast('setTitle', 'Generated Abstract');
	});
	// }}}

	$scope.$evalAsync(() => $scope.refresh());
});
