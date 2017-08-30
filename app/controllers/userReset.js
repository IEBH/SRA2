app.controller('userResetController', function($scope, $stateParams, Users) {
	$scope.userDetails = {password: '', password2: ''};

	$scope.response;
	$scope.submit = function() {
		if (!$scope.userDetails.password) {
			$scope.response = {error: 'You must enter a new password'};
		} else if (!$scope.userDetails.password2) {
			$scope.response = {error: 'You must enter the same password again'};
		} else if ($scope.userDetails.password != $scope.userDetails.password2) {
			$scope.response = {error: 'Your passwords do not match'};
		} else {
			Users.reset({
				token: $stateParams.token,
				password: $scope.userDetails.password,
			}).$promise
				.then(res => $scope.response = res)
		}
	};
});
