app.controller('libraryRequestController', function($scope, $location, Tasks) {
	$scope.submit = function() {
		Tasks.fromLibrary({id: $scope.library._id, worker: 'request'}, {settings: {
			user: _.pick($scope.user, ['email', 'name', 'title', 'libraryNo', 'faculty', 'position'])
		}}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	};
});
