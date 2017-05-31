app.controller('libraryCompareReviewController', function($scope, $location, $rootScope, $stateParams, Libraries, References, Tasks) {
	$scope.loading = true;
	$scope.task = null;

	// Deal with breadcrumbs {{{
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title},
			{url: '/libraries/' + $scope.library._id + '/compare', title: 'Compare'},
		]);
		$rootScope.$broadcast('setTitle', 'Comparison Results');
	});
	// }}}

	// Load state {{{
	if (!$stateParams.id) return $location.path('/libraries');
	if (!$stateParams.taskid) return $location.path('/libraries/' + $stateParams.id);
	Tasks.get({id: $stateParams.taskid}).$promise.then(function(task) {
		$scope.loading = false;
		$scope.task = task;
	});
	// }}}

	// .conflicts / .libraryLookup {{{
	// Rearrange the server output into something we can easily iterate over
	$scope.conflicts = null;
	$scope.libraryLookup = {};
	$scope.$watch('task', function() {
		if (!$scope.task) return;
		$scope.task.result.libraries.forEach(function(libId) {
			if ($scope.libraryLookup[libId] === undefined) $scope.libraryLookup[libId] = Libraries.get({id: libId, populate: 'owners'});
		});

		$scope.conflicts = $scope.task.result.conflicts.map(function(conflict) {
			var item = {
				libraries: [], // library IDs of conflicts (horizontal layout)
				references: [], // reference IDs of conflicted references (horizontal layout)
				fields: {}, // Hash of fields that conflict
				active: {}, // Hash of currently active keys (defaults to fields[0] in each case)
			};
			var refMap = {};

			Object.keys(conflict).forEach(function(library, libraryIndex) {
				if (library == '_id') {
					refMap = conflict[library];
				} else {
					item.libraries.push(library);
					item.references.push(refMap[library]);
					Object.keys(conflict[library]).forEach(function(field) {
						if (!item.fields[field]) item.fields[field] = [];
						if (!item.active[field] && conflict[library][field] != 'MISSING') item.active[field] = conflict[library][field];
						item.fields[field].push(conflict[library][field]);
					});
				}
			});
			return item;
		});
	});
	// }}}

	// Handle selection {{{
	$scope.rowSetActive = function(conflict, field, item) {
		conflict.active[field] = item;
	};
	// }}}

	// .resubmit() {{{
	$scope.resubmit = function() {
		Tasks.fromLibrary(
			{id: $scope.task.result.libraries[0], worker: 'library-compare'},
			{settings: {libraries: $scope.task.result.libraries.slice(1)}}
		).$promise.then(function(task) {
			$location.path('/libraries/task/' + task._id);
		});
	};
	// }}}
});
