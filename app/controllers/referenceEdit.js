app.controller('referenceEditController', function($scope, $async, $location, $q, $stateParams, $rootScope, References, ReferenceTags) {
	$scope.loading = true;
	$scope.reference = null;
	$scope.tags = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$stateParams.refId) return $location.path('/libraries');
		References.get({
			id: $stateParams.refId,
			populate: 'library,tags',
		}).$promise.then(function(data) {
			$scope.loading = false;
			// Decorators {{{
			['authors', 'urls'].forEach(field => {
				if (data[field]) data[field] = data[field].join("\n");
			});
			data.tags = data.tags
				.map(tag => {
					return tag.title;
				})
				.join("\n");
			// }}}
			$scope.reference = data;

			// Fetch tags for this library {{{
			if (!$scope.tags)
				ReferenceTags.queryCached({library: $scope.reference.library._id, status: 'active'}).$promise.then(function(data) {
					$scope.tags = data;
				});
			// }}}
		});
	};
	$scope.$evalAsync($scope.refresh);
	// }}}

	// Data saver {{{
	$scope.save = function() {
		var defer = $q.defer();
		var obj = angular.copy($scope.reference);

		var async = $async();

		// Convert library back into string {{{
		if (obj.library) obj.library = obj.library._id;
		// }}}

		// Compress textareas back into arrays {{{
		['authors', 'keywords', 'urls'].forEach(field => {
			if (obj[field]) {
				obj[field] = obj[field]
					.toString()
					.split(/\n+/)
					.map(line => _.trim(line));
			} else
				obj[field] = [];
		});
		// }}}

		// Compress tags into their IDs (or create new tags if we don't recognise it) {{{
		var makeTags = [];
		var madeTags = [];
		if (obj.tags) {
			obj.tags = obj.tags
				.toString()
				.split(/\n+/)
				.map(line => _.trim(line))
				.filter(tag => {
					var existingTag = _.find($scope.tags, {title: tag});
					if (existingTag) return true;
					// If we get here its a new tag
					makeTags.push(tag);
				})
				.map(existingTag => _.find($scope.tags, {title: existingTag})._id);
		} else
			obj.tags = [];

		async.forEach(makeTags, (next, tag) => {
			ReferenceTags.create({
				library: $scope.reference.library._id,
				title: tag,
			}).$promise
				.then((newTag) => {
					madeTags.push(newTag._id);
					next();
				}, function(err) {
					next(err);
				});
		});
		// }}}

		async
			.then(next => {
				// Gather newly created tags into the object before we save it
				madeTags.forEach(newId => obj.tags.push(newId));
				References.save({id: $scope.reference._id}, obj).$promise
					.then(data => next(), err => next(err));
			})
			.end(err => {
				console.log('ASYNC ERR', err);
				if (err) return defer.reject(err);
				defer.resolve();
			});

		return defer.promise;
	};
	// }}}

	// Form submission {{{
	$scope.submit = function() {
		$scope.save().then(() => $location.path('/libraries/' + $scope.reference.library));
	};
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('reference', function() {
		if (!$scope.reference) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.reference.library._id, title: $scope.reference.library.title},
		]);
		$rootScope.$broadcast('setTitle', $scope.reference.title);
	});
	// }}}
});
