app.controller('libraryCopyController', function($scope, $location, $rootScope, Tasks) {
	$scope.errors = [];
	$scope.title = null;

	$scope.submit = function() {
		if (!$scope.library) return;
		$scope.errors = [];
		if (!$scope.title) $scope.errors.push({text: 'You must specify a title'});
		if (!$scope.errors.length) {
			Tasks.fromLibrary({id: $scope.library._id, worker: 'library-copy'}, {settings: {library: {title: $scope.title}}}).$promise.then(function(task) {
				$location.path('/libraries/task/' + task._id);
			});
		}
	};

	// Set an initial title {{{
	$scope.$watch('library', function() {
		if (!$scope.library || !$scope.library.title) return; // Not ready yet
		if ($scope.title) return; // User has already set a title
		$scope.title = $scope.library.title + ' (Copy - ' + moment().format('dddd MMMM do YYYY h:mma') + ')';
	});
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
		]);
		$rootScope.$broadcast('setTitle', 'Copy');
	});
	// }}}
});
