app.controller('libraryShareController', function($scope, $interpolate, $location, $rootScope, Libraries) {
	$scope.emails = '';
	$scope.body = '';

	$scope.errors = [];
	$scope.submit = function() {
		$scope.errors = [];
		if (!$scope.emails) $scope.errors.push({text: 'No email addresses specified'});
		if (!$scope.body) $scope.errors.push({text: 'No message specified'});

		if (!$scope.errors.length) {
			Libraries.share({id: $scope.library._id}, {
				email: $scope.emails.split(/\s*[^A-Z0-9\-@_\.]+\s*/i),
				body: $scope.body,
			}).$promise
				.then(function() {
					alert('An email will be sent shortly');
					$location.path('/libraries/' + $scope.library._id);
				}, function(err, res) {
					alert('An error occured: ' + err.toString());
				});
		}
	};

	// Setup default message {{{
	$scope.$watchGroup(['user._id', 'library'], function() {
		if (!$scope.user._id || !$scope.library || !$scope.library.title) return; // We dont have all the data yet
		if ($scope.body) return; // We already have a body
		$scope.body = 
			$scope.user.name + " would like to share a reference library with you via CREBP-SRA:\n\n" +
			"Library: " + $scope.library.title + "\n\n" +
			"   http://crebp-sra.com/#/libraries/" + $scope.library._id + "\n\n" +
			"The CREBP-SRA team";
	});
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'Share');
	});
	// }}}
});
