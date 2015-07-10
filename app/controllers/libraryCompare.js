app.controller('libraryCompareController', function($scope, $rootScope, Libraries) {
	$scope.comparisons = [];

	// Convert rawUrls => comparisons {{{
	$scope.errors = [];
	$scope.rawUrls = null;
	$scope.$watch('rawUrls', function() {
		if (!$scope.rawUrls) return;
		$scope.errors = [];

		$scope.comparisons = /[a-f0-9]{24}/i.exec($scope.rawUrls).map(function(hash, index) {
			if (index == 0) return { // Return original libary as first item
				_id: $scope.library._id,
				library: $scope.library,
				references: $scope.references,
				error: null,
				loaded: true,
			};

			if (!hash) return;
			var existing = _.find($scope.comparisons, {_id: hash});
			if (existing) return existing; // Already know about this library

			// New ID
			var newObj = {_id: hash, loaded: false, error: null, library: null, references: null};
			// Load library + references {{{
			Libraries.get({id: hash}).$promise
				.then(function(data) {
					newObj.library = data;
					References.query({library: newObj.library._id, status: 'active'}).$promise
						.then(function(data) {
							newObj.references = data;
						}, function(err) {
							newObj.error = 'References: ' + err;
						}).finally(function() {
							newObj.loaded = true;
						});
				}, function(err) {
					newObj.error = 'Library: ' + err;
				});
			// }}}
			return newObj;
		});

		if (!$scope.comparisons.length) $scope.errors.push({text: 'Could not find anything that looks like a valid SRA library ID'});

		// Populate errors with any failed loads {{{
		$scope.comparisons.forEach(function(lib) {
			if (lib.error) $scope.comparisons.push({text: lib.error});
		});
		// }}}
	});
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'Compare');
	});
	// }}}
});
