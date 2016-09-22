app.controller('libraryDedupeController', function($scope, $location, $rootScope, Libraries, Tasks) {
	// Deal with breadcrumbs {{{
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'De-duplicate');
	});
	// }}}

	$scope.submit = function() {
		Tasks.fromLibrary({id: $scope.library._id, worker: 'library-dedupe'}, {settings: {
			references: $scope.filter.references,
		}}).$promise.then(function(data) {
			$location.path('/libraries/task/' + data._id);
		});
	};
});
