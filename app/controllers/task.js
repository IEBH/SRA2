app.controller('taskController', function($scope, $location, $stateParams, $timeout, $window, Settings, Tasks) {
	if (!$stateParams.id) return $location.path('/libraries');

	// Data refresher {{{
	$scope.task = {
		status: 'loading',
	};

	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);

		Tasks.get({id: $stateParams.id}).$promise
			.then(function(data) {
				$scope.task = data;
				if ($scope.task.status == 'completed') {
					if ($scope.task.destination) {
						$window.location = $scope.task.destination;
					} else {
						$location.path('/libraries/' + $scope.task.library);
					}
				} else {
					$scope.task.lastUpdate = moment().format('h:mm:ss a');
					if ($scope.task && $scope.task.progress && $scope.task.progress.current > 0) {
						$scope.task.progress.percent = Math.ceil(($scope.task.progress.current / $scope.task.progress.max) * 100);
					} else {
						$scope.task.progress = {
							current: 0,
							max: 100,
							percent: 0
						};
					}
				}
			})
			.finally(function() {
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.task);
			});
	};
	$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.task);
	// }}}
});
