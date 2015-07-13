app.controller('libraryCompareController', function($scope, $rootScope, Libraries, References) {
	$scope.mode = 'prepare'; // prepare|compare
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
			referenceCount: $scope.references.length,
			error: null,
			loaded: true,
		}].concat($scope.rawUrls.match(/[a-f0-9]{24}/ig).map(function(hash, index) {
			if (!hash) return;
			var existing = _.find($scope.comparisons, {_id: hash});
			if (existing) return existing; // Already know about this library

			// New ID
			var newObj = {_id: hash, loaded: false, error: null, library: null, referenceCount: null};
			// Load library + references {{{
			Libraries.get({id: hash}).$promise
				.then(function(data) {
					newObj.library = data;
					References.count({library: newObj.library._id, status: 'active'}).$promise
						.then(function(data) {
							newObj.referenceCount = data.count;
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

	// Mode toggles {{{
	$scope.setMode = function(mode) {
		$scope.mode = mode;
		if (mode == 'compare') {
			Libraries.compare({id: $scope.library._id}, {libraries: $scope.comparisons.slice(1).map(function(lib) { return lib._id })}).$promise.then(function(data) {
				console.log('DAT', data);
			});
		}
	};
	// }}}
});
