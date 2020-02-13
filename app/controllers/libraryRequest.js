app.controller('libraryRequestController', function($scope, $location, $notification, Tasks) {
	$scope.ccUser = true;

	$scope.agree = {
		copyright: false,
		terms: false,
	};

	$scope.submit = function() {
		if (!$scope.agree.copyright) {
			return $notification.error('You must agree to the copyright notice');
		} else if (!$scope.agree.terms) {
			return $notification.error('You must agree to the terms');
		} else if (!$scope.agree.searched) {
			return $notification.error('You must agree to the terms');
		}

		Tasks.fromLibrary({id: $scope.library._id, worker: 'library-request'}, {settings: {
			user: _.pick($scope.user, ['email', 'name', 'title', 'libraryNo', 'faculty', 'position']),
			ccUser: $scope.ccUser,
			references: $scope.filter.references,
		}}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	};
});
