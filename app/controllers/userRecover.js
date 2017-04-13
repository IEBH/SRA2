app.controller('userRecoverController', function($scope, Users) {
	$scope.userDetails = {email: ''};

	$scope.response;
	$scope.submit = function() {
		Users.recover($scope.userDetails).$promise
			.then(res => $scope.response = res)
	};
});
