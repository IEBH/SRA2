// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, User, Library) {
	// .user {{{
	User.profile().$promise.then(function(data) {
		$scope.user = data;
	});
	// }}}
	// .libraries {{{
	$scope.libraries = Library.query();
	// }}}
});
