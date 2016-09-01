app.controller('libraryController', function($scope, $rootScope, $httpParamSerializer, $interval, $location, $stateParams, $window, Libraries, References, ReferenceTags, Tasks) {
	$scope.loading = true;
	$scope.library = null;
	$scope.tags = null;
	$scope.hasTags = false; // True if its not just meta tags
	$scope.tagsObj = null; // Object lookup for tags
	$scope.activeTag = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$scope.library) return;

		// Library {{{
		Libraries.get({id: $scope.library._id}).$promise.then(function(data) {
			$scope.library = data;
			// Decorators {{{
			// Default values {{{
			if (!$scope.library.screening) $scope.library.screening = {};
			if (!$scope.library.screening.weightings) $scope.library.screening.weightings = [];
			// }}}
			// Files {{{
			if ($scope.library.files) {
				var fileIcons = [
					{re: /\.pdf$/i, icon: 'fa fa-file-pdf-o'},
					{re: /\.(jpe?g|gif|png|webm)$/i, icon: 'fa fa-file-image-o'},
					{re: /\.txt$/i, icon: 'fa fa-file-text-o'},
					{re: /\.docx?$/i, icon: 'fa fa-file-word-o'},
					{re: /\.(zip|rar)$/i, icon: 'fa fa-file-archive-o'},
					{re: /\.pptx?$/i, icon: 'fa fa-file-powerpoint-o'},
					{re: /\.(mov|avi|mp4|mpe?g)?$/i, icon: 'fa fa-file-video-o'},
					{re: /\.(au|mp3|ogg?)?$/i, icon: 'fa fa-file-audio-o'},
					{re: /./, icon: 'fa fa-file-o'},
				];
				$scope.library.files = $scope.library.files.map(file => {
					file.icon = (fileIcons.find(function(fi) { return re.match(file.name) })).icon;
				});
			}
			// }}}
			// }}}
		});
		// }}}
		// Reference Tags {{{
		ReferenceTags.query({library: $scope.library._id}).$promise.then(function(data) {
			$scope.tagsObj = {};

			// Add meta tags {{{
			data.push({
				_id: '_all',
				meta: true,
				title: 'All',
				icon: 'fa fa-star',
				filter: function(ref) { return true },
			});
			data.push({
				_id: '_untagged',
				meta: true,
				title: 'Untagged',
				icon: 'fa fa-star-o',
				filter: function(ref) { return !ref.tags || !ref.tags.length },
			});
			// }}}

			$scope.tags = data
				.sort(function(a, b) {
					if (a.meta && !b.meta) {
						return -1;
					} else if (b.meta && !a.meta) {
						return 1;
					} else if (a.title > b.title) {
						return 1;
					} else if (b.title < a.title) {
						return -1;
					} else {
						return 0;
					}
				})
				.map(function(tag) {
					if (tag.meta) return tag;
					tag.meta = false;
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
			$scope.hasTags = _.some($scope.tags, {meta: false});
			if ($location.search()['tag']) $scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
		});
		// }}}
	};
	// }}}

	// Saver {{{
	/**
	* Attempt to save various library information and reload from server
	* @param array|string keys Optional key or keys of information to save, if omitted all safe fields will be used
	* @param string url Optional URL to navigate to after saving
	*/
	$scope.save = function(keys, url) {
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
	/**
	* Quickly set a property of the library object
	* @param string key The key to set
	* @param string value The value to set
	*/
	$scope.set = function(key, value, url) {
		$scope.library[key] = value;
		$scope.save(key);
	};
	// }}}

	// Display columns {{{
	$scope.isScreening = false;
	$scope.$watch('library', function() {
		$scope.isScreening = (
			$scope.library &&
			$scope.library.screening &&
			$scope.library.screening.lastWeighting &&
			$scope.library.screening.lastWeighting.hash
		);
	});
	// }}}

	// Watchers {{{
	// Set the breadcrumb title if we dont already have one {{{
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setTitle', $scope.library.title);
	});
	// }}}

	// Recalculate the meta tag numbers {{{
	$scope.$watch('references', function() {
		if (!$scope.references || !$scope.tags) return;

		var tag = _.find($scope.tags, {_id: '_all'});
		tag.referenceCount = $scope.references.length;

		var tag = _.find($scope.tags, {_id: '_untagged'});
		tag.referenceCount = $scope.references.filter(function(ref) {
			return !ref.tags || !ref.tags.length;
		}).length;
	});
	// }}}

	// Reset the active tag if we're coming from another location {{{
	$scope.$on('$locationChangeSuccess', function() {
		if ($scope.tags) {
			$scope.activeTag = _.find($scope.tags, {_id: $location.search()['tag']});
			$scope.refresh();
		}
	});
	// }}}

	// .isOwner / .isEditable {{{
	$scope.isOwner = false;
	$scope.isEditable = false;
	$scope.$watchGroup(['library', 'user._id'], function() {
		if (!$scope.library || !$scope.library._id || !$scope.user._id) return; // Not loaded yet
		if (_.includes($scope.library.owners, $scope.user._id)) { // User is already an owner
			$scope.isOwner = true;
			$scope.isEditable = true;
		} else {
			$scope.isOwner = false;
			$scope.isEditable = false;
		}
	});
	// }}}
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
		$scope.$evalAsync($scope.refresh);
	}

	if ($location.search()['sort']) $scope.setSort($location.search()['sort']);
	// }}}
});
