app.controller('libraryOperationStatus', function($scope, $location, $stateParams, $timeout, Libraries, Settings) {
	if (!$stateParams.id) return $location.path('/libraries');

	// Data refresher {{{
	$scope.operation = null;

	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);

		Libraries.operation({id: $stateParams.id}).$promise
			.then(function(data) {
				$scope.operation = data;
				if ($scope.operation.status == 'completed') {
					$location.path('/libraries/' + $scope.operation.library);
				} else {
					$scope.operation.lastUpdate = moment().format('h:mm:ss a');
					if ($scope.operation.progress.current > 0) {
						$scope.operation.progress.percent = Math.ceil($scope.operation.progress.current / $scope.operation.progress.max);
					} else {
						$scope.operation.progress.percent = 100;
					}
				}
			})
			.finally(function() {
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.operationStatus);
			});
	};
	$scope.refresh();
	// }}}
});
