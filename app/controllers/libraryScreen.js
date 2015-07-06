// NOTE: This controller requires that its nested as the child of libraryController
app.controller('libraryScreenController', function($scope, $location) {
	$scope.ref = null;
	$scope.options = {
		show: {
			title: true,
			abstract: true,
			fulltext: false,
		},
	};

	// Keyword highlighting {{{
	$scope.highlightWrapper = '<span class="label label-info">{{item.text}}</span>';
	$scope.highlightTags = ['h1', 'p', 'div'];
	$scope.highlightTerms = null;
	$scope.$watch('library.screening.weightings', function() {
		if (!$scope.library.screening.weightings) return;
		$scope.highlightTerms = $scope.library.screening.weightings.map(function(weighting) {
			return weighting.keyword;
		});
	});
	// }}}

	// Modals {{{
	$scope.showConfig = function() {
		angular.element('#modal-screening-options')
			.modal('show')
			.one('hide.bs.modal', $scope.$parent.save);
	};
	// }}}

	// Reference moving {{{
	$scope.moveFirst = function() {
		if ($scope.references.length == 0) $location.path('/libraries/' + $scope.library._id);
		$scope.ref = $scope.references[0];
	};

	$scope.movePrev = function() {
		var offset = $scope.ref ? _.findKey($scope.references, {_id: $scope.ref._id})-1 : 0;
		if (offset < 0) offset = 0;
		$scope.ref = $scope.references[offset];
	};

	$scope.moveNext = function() {
		var offset = $scope.ref ? parseInt(_.findKey($scope.references, {_id: $scope.ref._id})) + 1 : 0;
		if (offset > $scope.references.length) $location.path('/libraries/' + $scope.library._id);
		$scope.ref = $scope.references[offset];
	};
	// }}}

	$scope.$watch('references', function() {
		if ($scope.references && !$scope.ref) $scope.moveFirst();
	});
});
