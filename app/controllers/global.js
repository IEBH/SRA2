// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, $location, $timeout, Users) {
	// .user {{{
	$scope.user = {};

	/** Attempt to login to the server with the supplied details
	* If the details are omitted a 'relog' occurs to refresh user details
	* @param object e Event object
	* @param object details Optional object of login details (must contain at least .username, .password)
	*/
	$scope.$on('preLogin', function(e, details) {
		if (details && details.username) {
			Users.login({}, details).$promise.then(function(data) {
				_.forEach($scope.user, function(v, key) { // Clear existing user object
					delete $scope.user[key];
				});
				_.assign($scope.user, data);
				if (!$scope.user.settings) $scope.user.settings = {};
				$timeout(function() {
					$rootScope.$broadcast('login');
					$location.path('/');
				});
			});
		} else { // Grab cookie from server and attempt to login
			Users.profile().$promise.then(function(data) {
				_.assign($scope.user, data);
				if (!$scope.user.settings) $scope.user.settings = {};
				$timeout(function() {
					$rootScope.$broadcast('login');
				});
			});
		}
	});
	$scope.$emit('preLogin'); // Trigger initial login

	$scope.$on('logout', function() {
		Users.logout().$promise.then(function() {
			_.forEach($scope.user, function(v, key) {
				delete $scope.user[key];
			});
			$location.path('/');
		});
	});
	// }}}
});
