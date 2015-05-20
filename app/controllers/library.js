app.controller('libraryController', function($scope, $rootScope, $interval, $location, $stateParams, Libraries, References, ReferenceTags) {
	$scope.library = null;
	$scope.tags = null;
	$scope.activeTag = null;
	$scope.references = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.library) return;

		// Library {{{
		Libraries.get({id: $scope.library._id}).$promise.then(function(data) {
			$scope.library = data;
			// Decorators {{{
			// .referenceCount {{{
			$scope.library.referenceCount = null;
			References.count({library: $scope.library._id}).$promise.then(function(countData) {
				$scope.library.referenceCount = countData.count;
			});
			// }}}
			// }}}
		});
		// }}}

		// References {{{
		var rQuery = {library: $scope.library._id, status: 'active'};
		if ($scope.activeTag) rQuery.tags = $scope.activeTag._id;

		References.query(rQuery).$promise.then(function(data) {
			$scope.references = data;
		});
		// }}}

		// Reference Tags {{{
		ReferenceTags.query({library: $scope.library._id}).$promise.then(function(data) {
			$scope.tags = data
				// Decorators {{{
				// .referenceCount {{{
				.map(function(tag) {
					tag.referenceCount = null;
					References.count({library: $scope.library._id, tags: tag._id}).$promise.then(function(countData) {
						tag.referenceCount = countData.count;
					});
					return tag;
				});
				// }}}
				// }}}
			if ($location.search()['tag']) $scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
		});
		// }}}
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

	$scope.$on('$locationChangeSuccess', function() {
		if ($scope.tags) {
			$scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
			$scope.refresh();
		}
	});
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
