app.directive('textselect', function() {
	return {
		scope: {
		},
		restrict: 'EA',
		controller: function($scope, $element) {
			$scope.getSelected = function() {
				if ((window.getSelection()).toString()) {
					if ((window.getSelection()).toString()==""){
						return false;
					}else{
						return (window.getSelection()).toString();
					}
				}else if (document.getSelection) {
					if ((document.getSelection).toString()==""){
						return false;
					}else{
						return (document.getSelection()).toString();
					}
				}else {
					var selection = document.selection && document.selection.createRange();
					if (selection.text && selection.text!="") {
						return selection.text;
					}else{
						return false;
					}
				}
				return false;
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
