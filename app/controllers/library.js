app.controller('libraryController', function($scope, $rootScope, $interval, $location, $stateParams, Libraries, References, ReferenceTags, Tasks) {
	$scope.loading = true;
	$scope.library = null;
	$scope.tags = null;
	$scope.tagsObj = null; // Object lookup for tags
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
			$scope.loading = false;
		});
		// }}}

		// Reference Tags {{{
		ReferenceTags.query({library: $scope.library._id}).$promise.then(function(data) {
			$scope.tagsObj = {};

			// Sort data {{{
			// }}}

			$scope.tags = data
				.sort(function(a, b) {
					if (a.title > b.title) {
						return 1;
					} else if (b.title < a.title) {
						return -1;
					} else {
						return 0;
					}
				})
				.map(function(tag) {
					// Decorators {{{
					// .referenceCount {{{
					tag.referenceCount = null;
					References.count({library: $scope.library._id, tags: tag._id}).$promise.then(function(countData) {
						tag.referenceCount = countData.count;
					});
					// }}}
					// Add to tagsObj lookup {{{
					$scope.tagsObj[tag._id] = tag;
					// }}}
					return tag;
					// }}}
				})
			if ($location.search()['tag']) $scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
		});
		// }}}
	};
	// }}}

	// Selected references {{{
	$scope.selected = [];
	/**
	* Called on each references.selected change to populate $scope.selected
	*/
	$scope.determineSelected = function() {
		$scope.selected = $scope.references.filter(ref => { return !! ref.selected });
	};

	$scope.selectAction = function(what, operand) {
		switch (what) {
			case 'all':
				$scope.references.forEach(ref => { ref.selected = true });
				break;
			case 'none':
				$scope.references.forEach(ref => { ref.selected = false });
				break;
			case 'invert':
				$scope.references.forEach(ref => { ref.selected = !ref.selected });
				break;
			case 'tag':
				if ($scope.selected.every(ref => { return _.contains(ref.tags, operand._id) })) { // Are we untagging?
					$scope.selected.forEach(ref => {
						ref.tags = _.without(ref.tags, operand._id);
					});
				} else { // Tagging
					$scope.selected.forEach(ref => {
						if (!_.contains(ref.tags, operand._id)) ref.tags.push(operand._id);
					});
				}
				break;
			case 'tag-clear':
				$scope.selected.forEach(ref => {
					ref.tags = [];
				});
				break;
		}
		$scope.determineSelected();
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
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setTitle', $scope.library.title);
	});

	$scope.$on('$locationChangeSuccess', function() {
		if ($scope.tags) {
			$scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
			$scope.refresh();
		}
	});
	// }}}

	// Reference inline edit {{{
	$scope.reference = null;

	$scope.editTags = function(reference) {
		$scope.reference = reference;
		$('#modal-tagEdit').modal('show');
	};

	$scope.toggleTag = function(tag) {
		var index = _.indexOf($scope.reference.tags, tag._id);
		if (index > -1) {
			$scope.reference.tags.splice(index, 1);
		} else {
			$scope.reference.tags.push(tag._id);
		}
	};

	$scope.saveReference = function() {
		References.save({id: $scope.reference._id}, _.pick($scope.reference, ['title', 'tags'])).$promise
			.then($scope.refresh);
	};
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
		Libraries.clear({id: $stateParams.id}).$promise.then(function(data) {
			$location.path('/libraries/' + data._id);
		});
	} else if ($stateParams.operation == 'fulltext') {
		Tasks.fromLibrary({id: $stateParams.id, worker: 'dummy'}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	} else if ($stateParams.operation == 'dummy') {
		Tasks.fromLibrary({id: $stateParams.id, worker: 'dummy'}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	} else {
		$scope.library = {_id: $stateParams.id};
		$scope.refresh();
	}
	// }}}
});
