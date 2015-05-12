app.controller('libraryOperation', function($scope, $location, $routeParams) {
	// Operations {{{
	$scope.operations = [
		{
			id: 'view',
			title: 'View the library',
			urlExisting: '/libraries/:id'
		},
		{
			id: 'import',
			title: 'Import references',
			urlExisting: '/libraries/:id/import'
		},
		{
			id: 'export',
			title: 'Export references',
			urlExisting: '/libraries/:id/export'
		},
		{
			id: 'dedupe',
			title: 'Deduplicate',
			urlExisting: '/libraries/:id/dedupe'
		},
		{
			id: 'screen',
			title: 'Screen references',
			urlExisting: '/libraries/:id/screen'
		},
		{
			id: 'tags',
			title: 'Edit the library tags',
			urlExisting: '/libraries/:id/tags'
		},
		{
			id: 'share',
			title: 'Share the library',
			urlExisting: '/libraries/:id/share'
		},
		{
			id: 'collabmatrix',
			title: 'Generate a collaboration matrix',
			urlExisting: '/libraries/:id/collabmatrix'
		},
		{
			id: 'clear',
			title: 'Clear the library',
			urlExisting: '/libraries/:id/clear'
		},
		{
			id: 'delete',
			title: 'Delete the library',
			urlExisting: '/libraries/:id/delete'
		}
	];
	$scope.operation = _.find($scope.operations, {id: 'view'});

	$scope.setOperation = function(value) {
		$scope.operation = value;
	};
	// }}}

	// Libraries {{{
	$scope.library = null;
	$scope.setLibrary = function(value) {
		$scope.library = value;
	};
	// }}}

	// Submission {{{
	$scope.error = null;
	$scope.submit = function() {
		$scope.error = null;
		if (!$scope.library) {
			$scope.error = 'You must select an existing library';
		} else if (!$scope.operation) {
			$scope.error = 'You must select an operation to perform';
		} else { // All is well
			$location.path($scope.operation.urlExisting.replace(':id', $scope.library._id));
		}
	};
	// }}}

	// Load state {{{
	console.log($routeParams);
	// }}}
});
