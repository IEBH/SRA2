app.controller('SearchController', function($scope, Searches) {
	$scope.searching = false;
	$scope.query = '';
	$scope.response = null;

	$scope.submit = function() {
		$scope.searching = true;
		Searches.get({
			method: $scope.method.id,
			q: $scope.query,
		}).$promise
			.then(function(data) {
				$scope.response = data;
			})
			.finally(function(data) {
				$scope.searching = false;
			});
	};

	// Advanced options {{{
	$scope.advanced = false;
	$scope.toggleAdvanced = function() {
		$scope.advanced = !$scope.advanced;
	};
	// }}}

	// Methods {{{
	$scope.methods = [
		{id: 'pubmed', title: 'PubMed'}
	];
	$scope.method = _.find($scope.methods, {id: 'pubmed'});

	$scope.setMethod = function(method) {
		$scope.method = method;
	};
	// }}}

	// Selected references {{{
	$scope.selected = [];
	/**
	* Called on each references.selected change to populate $scope.selected
	*/
	$scope.determineSelected = function() {
		$scope.selected = $scope.response.results.filter(ref => { return !! ref.selected });
	};

	$scope.selectAction = function(what, operand) {
		switch (what) {
			case 'all':
				$scope.response.results.forEach(ref => { ref.selected = true });
				break;
			case 'none':
				$scope.response.results.forEach(ref => { ref.selected = false });
				break;
			case 'invert':
				$scope.response.results.forEach(ref => { ref.selected = !ref.selected });
				break;
		}
		$scope.determineSelected();
	};
	// }}}
});
