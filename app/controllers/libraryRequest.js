app.controller('libraryRequestController', function($scope, Libraries) {
	$scope.submit = function() {
		Libraries.request({id: $scope.library._id}).$promise.then(function(data) {
			console.log('SUCCESS!', data);
		}, function(err) {
			console.log('FAILED BECAUSE', err);
		});
	};
});
