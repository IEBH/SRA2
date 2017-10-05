/**
* Bootstrap styled file uploader
*
* e.g.
*
*	<file-upload/>
*
* @param {function} onSelect Callback to run when the file contents change. Called as ({name})
* @emits fileUploadChange Emitted when the file contents change
*/

angular
	.module('app')
	.component('fileUpload', {
		bindings: {
			onSelect: '&?',
		},
		controller: function($scope, $element) {
			var $ctrl = this;

			$ctrl.text = 'Select file...';

			$ctrl.click = function() {
				$element.find('input[type=file]').trigger('click');
			};

			$ctrl.setFile = function(name) {
				$ctrl.text = name;
				if ($ctrl.onSelect) $ctrl.onSelect({name});
				$scope.$emit('fileUploadChange', name);
			};

			$ctrl.$onInit = ()=> {
				$element
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
							$ctrl.setFile(my.val().replace(/\\/g,'/').replace( /.*\//,''));
						});
					});
			};
		},
		template: `
			<input type="file" name="file"/>
			<a ng-click="$ctrl.click(this)" class="btn btn-primary">
				<i class="fa fa-file"></i>
				{{$ctrl.text}}
			</a>
		`,
	})
