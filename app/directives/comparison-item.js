app.directive('comparisonItem', function(ReferenceTags, $q) {
	return {
		scope: {
			comparisonItem: '=', // The value we are examining
			comparisonItemType: '=?', // The field type we are examining
			comparisonItemField: '=?', // Field name (auto fills comparisonItemType)
		},
		restrict: 'AE',
		template: 
			'<span ng-switch="comparisonItemType">' +
				'<span ng-switch-when="scalar">{{value}}</span>' +
				'<span ng-switch-when="array">' +
					'<span ng-repeat="item in value track by $index" class="badge badge-info">{{item}}</span>' +
				'</span>' +
				'<span ng-switch-when="tags">' +
					'<span ng-repeat="item in value track by $index" class="badge badge-info"><i class="fa fa-tag"></i> {{item}}</span>' +
				'</span>' +
				'<span ng-switch-when="error" class="badge badge-warning">{{value}}</span>' +
				'<span ng-switch-when="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</span>' +
				'<span ng-switch-default class="text-danger"><i class="fa fa-question-circle"></i> Unsupported type</span>' +
			'</span>',
		controller: function($scope) {
			$scope.value = angular.copy($scope.comparisonItem); // Broken link version of the value (so we can overwrite later)

			if ($scope.comparisonItemField) // Try to guess type from the field name
				switch ($scope.comparisonItemField) {
					case 'tags':
						if (!_.isArray($scope.value)) { // Usually something like 'MISSING'
							$scope.comparisonItemType = 'error';
						} else {
							$scope.comparisonItemType = 'loading';
							var promises = $scope.value.map(function(tagId, tagOffset) {
								return ReferenceTags.getCached({id: tagId}).$promise.then(function(data) {
									$scope.value[tagOffset] = data.title;
								});
							});
							$q.all(promises).then(function() {
								$scope.comparisonItemType = 'tags';
							});
						}
						break;
					case 'authors':
						if (!_.isArray($scope.value)) { // Usually something like 'MISSING'
							$scope.comparisonItemType = 'error';
						} else {
							$scope.comparisonItemType = 'array';
						}
						break;
					default:
						$scope.comparisonItemType = 'scalar';
				}
		},
	}
});
