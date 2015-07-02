app.directive('textselect', function() {
	return {
		scope: {
			textselectDropdown: '@',
		},
		restrict: 'EA',
		controller: function($scope, $element) {
			$scope.getSelected = function() {
				var handler = [
					window.getSelection ? window.getSelection().toString() : null,
					document.getSelection ? document.getSelection().toString() : null,
					document.selection && document.selection.createRange() ? selection.text : null
				].find();
				return handler;
			}

		},
		template: 
			'',
		link: function($scope, elem, attr, ctrl) {
			var dropdownID = '#' + $scope.textselectDropdown;
			$(dropdownID).hide();
			elem
				.on('mouseup', function(event) {
					var selection = $scope.getSelected();
					
					if (selection) {
						console.log("selection:", selection);

						$(dropdownID)
						.css( "top", event.offsetY )
						.css( "left", event.offsetX )
						.show();
					}else{
						$(dropdownID).hide();
					}
				});
		}
	}
});
