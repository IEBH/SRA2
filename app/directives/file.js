/**
* Bootstrap styled file uploader
*
* e.g.
*	
*	<file-upload/>
*
*/
app.directive('fileUpload', function() {
	return {
		scope: {
		},
		restrict: 'E',
		controller: function($scope, $element) {
			$scope.text = 'Select file...';

			$scope.click = function() {
				$element.find('input[type=file]').trigger('click');
			};

			$scope.setFile = function(name) {
				$scope.text = name;
			};
		},
		template: 
			'<input type="file" name="file"/>' +
			'<a ng-click="click(this)" class="btn btn-primary">' +
				'<i class="fa fa-file"></i>' +
				'{{text}}' +
			'</a>',
		link: function($scope, elem, attr, ctrl) {
			console.log('My name is', $scope.name);
			elem
				.find('input[type=file]')
				.css({
					position: 'absolute',
					'z-index': 2,
					top: 0,
					left: 0,
					filter: 'alpha(opacity=0)',
					'-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)',
					opacity: 0,
					'background-color': 'transparent',
					color: 'transparent',
				})
				.on('change', function() {
					var my = $(this);
					$scope.$apply(function() {
						$scope.setFile(my.val().replace(/\\/g,'/').replace( /.*\//,''));
					});
				});
		}
	}
});
