app.controller('libraryRequestController', function($scope, $location, Libraries) {
	$scope.submit = function() {
		Libraries.operationQueue({id: $scope.library._id, operation: 'request'}).$promise.then(function(data) {
			$location.path('/libraries/operation/' + data._id);
		});
	};
});
