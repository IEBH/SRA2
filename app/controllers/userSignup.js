app.controller('userSignupController', function($scope, $rootScope, Users) {
	// .signup {{{
	$scope.signup = null;
	$scope.errors = [];
	$scope.reset = function() {
		$scope.signup = {
			name: '',
			email: '',
			password: '',
			password2: ''
		};
		$scope.errors = [];
	};
	$scope.reset();
	// }}}

	// Validation {{{
	$scope.validate = function() {
		var errors = [];
		if (!$scope.signup.name) errors.push({text: 'Please provide your name'});
		if (!$scope.signup.email) errors.push({text: 'Please provide your email address'});
		if (!$scope.signup.password) errors.push({text: 'Please provide a password'});
		if (!$scope.signup.password2) errors.push({text: 'Please provide a confirmation password'});
		if ($scope.signup.password != $scope.signup.password2) errors.push({text: 'Your passwords do not match'});
		$scope.errors = errors;
	};
	// }}}

	$scope.submit = function() {
		$scope.validate();
		if ($scope.errors && $scope.errors.length) return;
		$scope.signup.username = $scope.signup.email;

		Users.signup({}, $scope.signup).$promise
			.then(function(user) {
				$rootScope.$broadcast('preLogin', {
					username: $scope.signup.username,
					password: $scope.signup.password
				});
				$scope.reset();
				$('#modal-signup').modal('hide');
			}, function(err) {
				var errText = err.data ? err.data : err.toString();
				if (/duplicate key error index: .*?username/.test(errText)) {
					$scope.errors.push({text: 'That username is already in use'});
				} else if (err.data && err.data.errmsg && /^E11000 duplicate key error/.test(err.data.errmsg)) {
					$scope.errors.push({text: 'That email address is already registered - try resetting your password'});
				} else {
					$scope.errors.push({text: 'Unknown error: ' + errText});
				}
			});
	};
});
