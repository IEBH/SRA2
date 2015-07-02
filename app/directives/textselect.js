app.directive('textselect', function() {
	return {
		scope: {
			textselectDropdown: '@',
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
			var dropdownID = '#' + $scope.textselectDropdown;
			$(dropdownID).hide();
			elem
				.on('mouseup', function() {
					var selection = $scope.getSelected();
					
					if (selection) {
						console.log("selection:",selection);
						$(dropdownID).show();
					}else{
						$(dropdownID).hide();
					}
				});
		}
	}
});
