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
		// task.result.fields[].width {{{
		$scope.maxPoints = Math.max.apply(this, task.result.words.map(word => word.points));
		$scope.task.result.words = $scope.task.result.words.map(word => {
			word.width = Math.ceil((word.points / $scope.maxPoints) * 100);
			return word;
		});
		// }}}
		// }}}
	});
	// }}}

	// Table sorting {{{
	$scope.sortCol = 'points';
	$scope.sortAZ = false;
	$scope.setSort = function(col) {
		if ($scope.sortCol == col) { // Already sorted by this - switch dir
			$scope.sortAZ = !$scope.sortAZ;
		} else {
			$scope.sortCol = col;
		}
	};
	// }}}
});
