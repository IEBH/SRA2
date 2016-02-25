app.controller('libraryWordFreqController', function($scope, $location, $rootScope, Libraries, Tasks) {
	$scope.comparisons = [];

	$scope.deburr = true;
	$scope.weights = {
		title: 1,
		keywords: 1,
		abstract: 1,
	};
	$scope.ignore = {
		common: true,
		numbers: true,
	};
	$scope.min = {
		points: 3,
		unique: 0,
	};

	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'Word-frequency analysis');
	});
	// }}}

	$scope.submit = function() {
		Tasks.fromLibrary({id: $scope.library._id, worker: 'word-freq'}, {settings: {
			references: $scope.filter.references,
			deburr: $scope.deburr,
			weights: $scope.weights,
			ignore: $scope.ignore,
			min: $scope.min,
		}}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	};
});
