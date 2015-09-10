app.controller('libraryWordFreqReviewController', function($scope, $location, $rootScope, $stateParams, Libraries, References, Tasks) {
	$scope.loading = true;
	$scope.task = null;

	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title},
			{url: '/libraries/' + $scope.library._id + '/word-freq', title: 'Word-frequency Analysis'},
		]);
		$rootScope.$broadcast('setTitle', 'Results');
	});
	// }}}

	// Load state {{{
	if (!$stateParams.id) return $location.path('/libraries');
	if (!$stateParams.taskid) return $location.path('/libraries/' + $stateParams.id);
	Tasks.get({id: $stateParams.taskid}).$promise.then(function(task) {
		$scope.loading = false;
		$scope.task = task;
		// Decorators {{{
		$scope.task.result = _.map($scope.task.result, (count, word) => {
			return {
				word: word,
				count: count,
			};
		});
		// }}}
	});
	// }}}
});
