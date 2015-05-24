app.controller('libraryRequestController', function($scope, Libraries) {
	$scope.submit = function() {
		Libraries.operationQueue({id: $scope.library._id, operation: 'request'}).$promise.then(function(data) {
			console.log('SUCCESS!', data);
		}, function(err) {
			console.log('FAILED BECAUSE', err);
		});
	};
});
