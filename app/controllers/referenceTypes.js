app.controller('referenceTypesController', function($scope, Assets) {
	$scope.types = [];

	// Data refresher {{{
	$scope.loading = true;
	$scope.refresh = function() {
		Assets.refTypes().$promise
			.then(function(data) {
				$scope.types = data;
			})
			.finally(function() {
				$scope.loading = false;
			});
	};

	$scope.$evalAsync($scope.refresh);
	// }}}
});
