app.controller('libraryOperation', function($scope, $rootScope, $location, $stateParams, Libraries) {
	// Operations {{{
	// NOTE: Dont forget to also update app/routes if any of these change
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
	$scope.newLibrary = {name: moment().format("MMM Do YYYY, h:mma")};
	$scope.setLibrary = function(value) {
		$scope.library = value;
	};
	// }}}

	// Formats {{{
	$scope.formats = null;
	$scope.format = null;
	Libraries.formats().$promise.then(function(data) {
		$scope.formats = data;
		var defaultLib = _.find($scope.formats, {id: 'endnotexml'});
		if (defaultLib) $scope.format = defaultLib;
	});

	$scope.setFormat = function(format) {
		$scope.format = format;
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
	if ($stateParams.operation == 'import') {
		$scope.operation = _.find($scope.operations, {id: 'import'});
		$scope.library = Libraries.get({id: $stateParams.id});
	} else if ($stateParams.operation == 'export') {
		$scope.operation = _.find($scope.operations, {id: 'export'});
		$scope.$watch('library', function() {
			if (!$scope.library || !$scope.library._id) return;
			$rootScope.$broadcast('setBreadcrumb', [
				{url: '/libraries', title: 'Libraries'},
				{url: '/libraries/' + $scope.library._id, title: $scope.library.title}
			]);
		}, true);
		$scope.library = Libraries.get({id: $stateParams.id});
	} else if ($stateParams.operation) {
		$scope.operation = _.find($scope.operations, {id: $stateParams.operation});
	}
	// }}}
});
