app.controller('referenceEditController', function($scope, $stateParams, $rootScope, References) {
	$scope.loading = true;
	$scope.reference = null;
	
	// Data refresher {{{
	$scope.refresh = function() {
		if (!$stateParams.id) return $location.path('/libraries');
		References.get({
			id: $stateParams.id,
			populate: 'library,tags',
		}).$promise.then(function(data) {
			$scope.loading = false;
			// Decorators {{{
			['authors', 'urls'].forEach(field => {
				if (data[field]) data[field] = data[field].join("\n");
			});
			data.tags = data.tags.map(tag => {
				return tag.title;
			});
			// }}}
			$scope.reference = data;
		});
	};
	$scope.$evalAsync($scope.refresh);

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
