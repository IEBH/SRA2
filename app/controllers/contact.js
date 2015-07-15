app.controller('contactController', function($scope, $http, $window) {
	$scope.name = '';
	$scope.subject = '';
	$scope.email = '';
	$scope.body = '';

	$scope.errors = [];
	$scope.submit = function() {
		$scope.errors = [];
		if (!$scope.name) $scope.errors.push({text: 'Please specify a name'});
		if (!$scope.email) $scope.errors.push({text: 'Please specify an email address'});
		if (!$scope.subject) $scope.errors.push({text: 'Please specify a subject'});
		if (!$scope.body) $scope.errors.push({text: 'Please specify a message'});

		if (!$scope.errors.length) {
			$http.post('/api/contact', {
				name: $scope.name,
				email: $scope.email,
				subject: $scope.subject,
				body: $scope.body,
			})
			.success(function(data) {
				alert('Thank you for your message\n\nSomeone will be in touch with you shortly');
				$window.location = '/';
			})
			.error(function(err) {
				$scope.errors.push({text: err});
			});
		}
	};
});
