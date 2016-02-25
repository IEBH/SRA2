// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, $debounce, $location, $timeout, Loader, Settings, Users) {
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
				if (!data.error) // All is well?
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
			window.location = '/';
		});
	});

	// Auto Save user fields {{{
	$scope.$watch('user', $debounce(function() {
		if (!$scope.user || !$scope.user.username) return; // User not yet logged in anyway
		Users.profileSave({}, _.pick($scope.user, ['email', 'name', 'title', 'libraryNo', 'faculty', 'position', 'settings']));
	}, Settings.debounce.user), true);
	// }}}
	// }}}
	// .breadcrumb {{{
	$scope.breadcrumbs = [];
	$scope.pageTitle = null;
	$scope.pageUrl = null;
	$rootScope.$on('setBreadcrumb', function(e, path) {
		$scope.breadcrumbs = path;
	});

	$rootScope.$on('setTitle', function(e, title) {
		$scope.pageTitle = title;
	});

	$rootScope.$on('$stateChangeStart', function(e, toState) {
		$scope.pageUrl = $location.path();
		if (toState.data) {
			$scope.breadcrumbs = toState.data.breadcrumbs || [];
			$scope.pageTitle = toState.data.title;
		} else {
			$scope.breadcrumbs = [];
		}
	});
	// }}}
	// .referenceBucket {{{
	// Structure which allows passing a large number of reference ID's between views
	$scope.referenceBucket = null;
	$scope.$on('referenceBucket', function(e, contents) {
		$scope.referenceBucket = contents;
	});
	$scope.getReferenceBucket = function() {
		return $scope.referenceBucket;
	};
	// }}}

	// Service hooks {{{
	$rootScope.loader = Loader.loaderData;
	// }}}
});
