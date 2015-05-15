app.controller('libraryController', function($scope, $rootScope, $location, $stateParams, Libraries, References) {
	$scope.library = null;
	$scope.references = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.library) return;
		Libraries.get({id: $scope.library._id}).$promise.then(function(data) {
			$scope.library = data;
		});
		References.query({library: $scope.library._id, status: 'active'}).$promise.then(function(data) {
			$scope.references = data;
		});
	};
	// }}}

	// Saver {{{
	/**
	* Attempt to save various library information and reload from server
	* @param array|string key Optional key or keys of information to save, if omitted all safe fields will be used
	* @param string url Optional URL to navigate to after saving
	*/
	$scope.save = function(key, url) {
		Libraries.save(
			{id: $scope.library._id},
			_.pick($scope.library, keys || ['status', 'title', 'tags'])
		).$promise.then(function() {
			if (url) {
				$location.path(url);
			} else {
				$scope.refresh();
			}
		});
	};
	// }}}

	// Settters {{{
	$scope.set = function(key, value) {
		$scope.library[key] = value;
		$scope.save(key);
	};
	// }}}

	// Watchers {{{
	$scope.$watch('library.title', function() { $rootScope.$broadcast('setTitle', $scope.library.title) });
	// }}}

	// Load state / Deal with simple operations {{{
	if (!$stateParams.id) {
		$location.path('/libraries');
	} else if ($stateParams.id == 'create') {
		Libraries.create({creator: $scope.user._id}).$promise.then(function(data) {
			$location.path('/libraries/' + data._id);
		});
	} else if ($stateParams.operation == 'delete') {
		Libraries.save({id: $stateParams.id}, {status: 'deleted'}).$promise.then(function() {
			$location.path('/libraries');
		});
	} else if ($stateParams.operation == 'clear') {
		Libraries.clear({id: $stateParams.id}).$promise.then(function() {
			$location.path('/libraries/' + data._id);
		});
	} else {
		$scope.library = {_id: $stateParams.id};
		$scope.refresh();
	}
	// }}}
});
