app.directive('textselect', function() {
	return {
		scope: {
		},
		restrict: 'EA',
		controller: function($scope, $element) {
			$scope.getSelected = function() {
				var handler = window.getSelection ? (window.getSelection()).toString() : null;
					
				return handler;
			}

		},
		template: 
			'',
		link: function($scope, elem, attr, ctrl) {
			elem
				.on('mouseup', function() {
					var selection = $scope.getSelected();
					if (selection) {
						alert(selection);
					}
				});
		}
	}
});
