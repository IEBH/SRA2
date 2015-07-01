app.directive('textselect', function() {
	return {
		scope: {
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
			elem
				.on('mouseup', function() {
					var selection = $scope.getSelected();
					console.log('selection:', JSON.stringify(selection));
					if (selection) {
						alert(selection);
					}
				});
		}
	}
});
