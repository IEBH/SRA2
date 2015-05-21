app.controller('userLoginController', function($scope, $rootScope) {
	$scope.loginDetails = {username: '', password: ''};
	$scope.login = function() {
		$rootScope.$broadcast('preLogin', $scope.loginDetails);
	};
});
