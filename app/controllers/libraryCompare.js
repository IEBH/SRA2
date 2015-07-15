/**
* Set up the comparison task for a library
* see libraryCompareReviewController for the result when the task has completed
*/
app.controller('libraryCompareController', function($scope, $rootScope, Libraries, Tasks) {
	$scope.comparisons = [];

	// Convert rawUrls => comparisons {{{
	$scope.errors = [];
	$scope.rawUrls = '';
	$scope.$watch('rawUrls', function() {
		if (!$scope.rawUrls) return;
		$scope.errors = [];

		$scope.comparisons = [{
			_id: $scope.library._id,
			library: $scope.library,
			error: null,
			loaded: true,
		}].concat($scope.rawUrls.match(/[a-f0-9]{24}/ig).map(function(hash, index) {
			if (!hash) return;
			var existing = _.find($scope.comparisons, {_id: hash});
			if (existing) return existing; // Already know about this library

			// New ID
			var newObj = {_id: hash, loaded: false, error: null, library: null};
			// Load library + references {{{
			Libraries.get({id: hash}).$promise
				.then(function(data) {
					newObj.library = data;
				}, function(err) {
					newObj.error = 'Library: ' + err;
				});
			// }}}
			return newObj;
		}));
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

	// Load fingerprint peers {{{
	$scope.peersLoading = true;
	$scope.peers = null;
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		if ($scope.library.parentage && $scope.library.parentage.fingerPrint) {
			Libraries.query({
				'parentage.fingerPrint': $scope.library.parentage.fingerPrint,
				'_id': '!=' + $scope.library._id,
				populate: 'owners',
			}).$promise.then(function(data) {
				$scope.peers = data;
				$scope.peersLoading = false;
			});
		} else {
			$scope.peers = [];
		}
	});

	$scope.addPeer = function(peer) {
		$scope.rawUrls += ($scope.rawUrls ? '\n' : '') + peer._id;
	};
	// }}}

	$scope.submit = function() {
		Tasks.fromLibrary(
			{id: $scope.comparisons[0]._id, worker: 'library-compare'},
			{libraries: $scope.comparisons.slice(1)}
		).$promise.then(function(task) {
			$location.path('/libraries/task/' + task._id);
		});
	};
	// }}}
});
