app.controller('logoutController', function($scope, $rootScope, $timeout) {
	$timeout(function() {
		$rootScope.$broadcast('logout');
	}, 2000);
});
