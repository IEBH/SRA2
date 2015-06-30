app.controller('libraryListController', function($scope, Libraries, References, Users) {
	$scope.libraries = null;

	$scope.$watch('libraryAllowNew + libraries', function() {
		if (!$scope.libraries) return;
		if ($scope.libraryAllowNew && $scope.libraries.length > 0 && $scope.libraries[0]._id == 'new') { // Already present
			return;
		} else if ($scope.libraryAllowNew) { // Prepend
			$scope.libraries.splice(0, 0, {_id: 'new', title: 'Create new library'});
		} else if (!$scope.libraryAllowNew && $scope.libraries.length > 0 && $scope.libraries[0]._id == 'new') { // Disable
			$scope.libraries.splice(0, 1);
		}

		// Default to new if no library is currently selected
		if ($scope.libraryAllowNew && !$scope.library) $scope.library = $scope.libraries[0];
	});

	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.user) return;
		Libraries.query({status: 'active', owners: $scope.user._id}).$promise.then(function(data) {
			$scope.libraries = data
				// Decorators {{{
				// .referenceCount {{{
				.map(function(library) {
					library.referenceCount = null;
					References.count({library: library._id}).$promise.then(function(countData) {
						library.referenceCount = countData.count;
					});
					return library;
				});
				// }}}
				// }}}
		});
	};
	$scope.refresh();
	// }}}

	// Share emails inline edit {{{
	$scope.library = null;
	$scope.editShare = function(library) {
		$scope.library = library;
		console.log("$scope.library:",$scope.library);
		$('#modal-shareLib').modal('show');
	};
	// }}}

	// Validate email address {{{
	$scope.validateEmail = function (email) {
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(email);
	}
	// }}}

	$scope.emailList = null;
	$scope.shareLib = function(library) {
		//Step1 Create new users with emails
		//Step2 Add new users to library's owners list
		var emailArray = $scope.emailList.split(";");
		console.log("emailArray:", emailArray);

		_.forEach(emailArray, function(v, key) {
			if ($scope.validateEmail(v.trim())){ //email is legal
				//Check whether the email exists
				Users.query({email: v.trim()}).$promise.then(function(user){
					if (user[0]){ //Add user to library's owners list
						if (_.indexOf(library.owners, user[0]._id) < 0){ //user is in owner's list
							library.owners.push(user[0]._id);
							Libraries.save(
								{id: library._id},
								_.pick(library.owners, ['owners'])
							);
						}
					}else{
						//Register user
						var signup= {};
						signup.username = v.trim();
						signup.email = signup.username;
						signup.name = 'New User';
						signup.password = 'qwaszx'

						Users.signup({}, signup).$promise.then(function(user){
							console.log('new user:', user);
							//Add new user to library's owners list
							library.owners.push(user._id);
							console.log("library.owners:",library.owners);
							Libraries.save(
								{id: library._id},
								_.pick(library.owners, ['owners'])
							);
						});
					}
				});
			}
		});

		//Step3 Email login details
	};
});
